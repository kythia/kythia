/**
 * @namespace: addons/pro/helpers/CloudflareApi.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

class CloudflareApi {
    /**
     * @param {object} deps Dependency Injection container
     * @param {object} deps.kythiaConfig kythiaConfig object (from kythia.kythiaConfig.js)
     * @param {object} deps.logger Logger instance
     * @param {object} deps.models Sequelize models object
     */
    constructor({ kythiaConfig, logger, models }) {
        this.logger = logger;
        this.models = models;

        this.apiToken = kythiaConfig.addons.pro.cloudflare.token;
        this.zoneId = kythiaConfig.addons.pro.cloudflare.zoneId;
        this.domainName = kythiaConfig.addons.pro.cloudflare.domain;

        if (!this.apiToken || !this.zoneId || !this.domainName) {
            this.logger.error('CloudflareApi: Missing API Token, Zone ID, or Domain Name in kythiaConfig!');
            throw new Error('CloudflareService failed to initialize: Missing kythiaConfig.');
        }

        this.baseUrl = `https://api.cloudflare.com/client/v4/zones/${this.zoneId}`;
        this.logger.info('Cloudflare Service: Initialized and ready.');
    }

    /**
     * Private function for all requests to Cloudflare (DRY Principle)
     * @param {string} endpoint API endpoint (e.g.: '/dns_records')
     * @param {string} method HTTP method
     * @param {object} body Request body
     * @returns {Promise<object>} JSON result from Cloudflare
     */
    async _request(endpoint, method = 'GET', body = null) {
        const url = `${this.baseUrl}${endpoint}`;
        const options = {
            method,
            headers: {
                Authorization: `Bearer ${this.apiToken}`,
                'Content-Type': 'application/json',
            },
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, options);
            const data = await response.json();

            if (!data.success) {
                this.logger.warn(`Cloudflare API Error: ${data.errors[0]?.message}`, {
                    endpoint,
                    errors: data.errors,
                });
                return { success: false, errors: data.errors };
            }

            return { success: true, result: data.result };
        } catch (error) {
            this.logger.error(`Cloudflare #request failed: ${method} ${endpoint}`, error);
            return { success: false, errors: [{ message: error.message }] };
        }
    }

    /**
     * Creates a new DNS record in Cloudflare AND in the local database.
     * --- FUNCTION TO BE MODIFIED ---
     * @param {number} subdomainId ID from 'subdomains' table
     * @param {string} subdomainName Subdomain name (e.g.: 'john-cool')
     * @param {object} recordData Record data
     * @param {'A'|'CNAME'|'TXT'|'MX'} recordData.type Record type
     * @param {string} recordData.name Host name (e.g.: '@', 'www', 'mail')
     * @param {string} recordData.value Record content (IP, domain, string)
     * @param {number} [recordData.priority] Only for MX
     * @returns {Promise<{success: boolean, record: object, error?: string}>}
     */
    async createRecord(subdomainId, subdomainName, { type, name, value, priority = 10 }) {
        const { DnsRecord } = this.models;

        const cloudflareName = name === '@' ? `${subdomainName}.${this.domainName}` : `${name}.${subdomainName}.${this.domainName}`;

        const apiBody = {
            type,
            name: cloudflareName,
            content: value,
            ttl: 1,
            proxied: false,
        };
        if (type === 'MX') apiBody.priority = priority;

        this.logger.info(`[CF] Attempting CREATE: ${type} ${cloudflareName} -> ${value}`);
        const apiResponse = await this._request('/dns_records', 'POST', apiBody);

        if (!apiResponse.success) {
            return { success: false, error: apiResponse.errors[0]?.message };
        }

        try {
            const newDbRecord = await DnsRecord.create({
                subdomainId,
                type,
                name,
                value,
                cloudflareId: apiResponse.result.id,
            });

            return { success: true, record: newDbRecord };
        } catch (dbError) {
            this.logger.error(`[CF] API call succeeded but DB save FAILED for subdomain ${subdomainId}.`, dbError);
            this.logger.warn(`[CF] Rolling back Cloudflare record ${apiResponse.result.id}...`);
            await this.deleteRecordByCloudflareId(apiResponse.result.id);
            return { success: false, error: 'Failed to save record to local database.' };
        }
    }

    /**
     * Deletes a DNS record from Cloudflare by our LOCAL ID.
     * @param {number} localRecordId Record ID from the 'dns_records' table
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async deleteRecord(localRecordId) {
        const { DnsRecord } = this.models;

        const record = await DnsRecord.findByPk(localRecordId);
        if (!record) {
            return { success: false, error: 'Record not found in local database.' };
        }

        this.logger.info(`[CF] Attempting DELETE: ID ${record.cloudflareId}`);
        const apiResponse = await this._request(`/dns_records/${record.cloudflareId}`, 'DELETE');

        if (!apiResponse.success) {
            if (apiResponse.errors[0]?.code === 81044) {
                this.logger.warn(`[CF] Record ${record.cloudflareId} already deleted on Cloudflare.`);
            } else {
                return { success: false, error: apiResponse.errors[0]?.message };
            }
        }

        await record.destroy();
        return { success: true };
    }

    /**
     * (Internal helper) Deletes a record from CF, used for rollback.
     */
    async deleteRecordByCloudflareId(cloudflareId) {
        this.logger.info(`[CF] Internal Rollback: Deleting ${cloudflareId}`);
        await this._request(`/dns_records/${cloudflareId}`, 'DELETE');
    }

    /**
     * Updates an existing DNS record in Cloudflare AND DB.
     * @param {object} existingRecord Instance of DnsRecord from Sequelize
     * @param {object} newData New data
     * @param {string} newData.value New record content
     * @param {number} newData.priority New priority (for MX)
     * @returns {Promise<{success: boolean, record: object, error?: string}>}
     */
    async updateRecord(existingRecord, { value, priority = 10 }) {
        const { Subdomain } = this.models;

        const subdomain = await Subdomain.findByPk(existingRecord.subdomainId, {
            attributes: ['name'],
        });
        if (!subdomain) {
            return { success: false, error: 'Subdomain associated with this record is missing.' };
        }

        const cloudflareName =
            existingRecord.name === '@'
                ? `${subdomain.name}.${this.domainName}`
                : `${existingRecord.name}.${subdomain.name}.${this.domainName}`;

        const apiBody = {
            type: existingRecord.type,
            name: cloudflareName,
            content: value,
            ttl: 1,
            proxied: false,
        };

        if (existingRecord.type === 'MX') {
            apiBody.priority = priority;
        }

        this.logger.info(`[CF] Attempting UPDATE: ID ${existingRecord.cloudflareId} -> ${value}`);
        const apiResponse = await this._request(`/dns_records/${existingRecord.cloudflareId}`, 'PATCH', apiBody);

        if (!apiResponse.success) {
            return { success: false, error: apiResponse.errors[0]?.message };
        }

        try {
            existingRecord.value = value;
            await existingRecord.save();

            return { success: true, record: existingRecord };
        } catch (dbError) {
            this.logger.error(`[CF] API update succeeded but DB save FAILED for record ${existingRecord.id}.`, dbError);
            return { success: false, error: 'Cloudflare updated, but local DB failed to save.' };
        }
    }
}

module.exports = CloudflareApi;
