/**
 * @namespace: addons/pro/register.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const CloudflareApi = require('./helpers/CloudflareApi');

module.exports = {
    async initialize(bot) {
        const summary = [];

        bot.addClientReadyHook((sequelize) => {
            const container = bot.client.container;
            const { logger, kythiaConfig, models } = container;
            const { KythiaUser, Subdomain, DnsRecord, Monitor } = models;

            if (KythiaUser && Subdomain) {
                KythiaUser.hasMany(Subdomain, { foreignKey: 'userId', as: 'subdomains', onDelete: 'CASCADE' });
                Subdomain.belongsTo(KythiaUser, { foreignKey: 'userId', as: 'kythiaUser' });
            }

            if (Subdomain && DnsRecord) {
                Subdomain.hasMany(DnsRecord, { foreignKey: 'subdomainId', as: 'dnsRecords', onDelete: 'CASCADE' });
                DnsRecord.belongsTo(Subdomain, { foreignKey: 'subdomainId', as: 'subdomain' });
            }

            if (KythiaUser && Monitor) {
                KythiaUser.hasMany(Monitor, { foreignKey: 'userId', as: 'monitors', onDelete: 'CASCADE' });
                Monitor.belongsTo(KythiaUser, { foreignKey: 'userId', as: 'kythiaUser' });
            }
            summary.push(' └─ DnsRecord & Monitor model associations registered.');

            try {
                const cloudflareService = new CloudflareApi({
                    kythiaConfig: kythiaConfig,
                    logger: logger,
                    models: models,
                });

                if (!bot.client.container.services) {
                    bot.client.container.services = {};
                }

                bot.client.container.services.cloudflare = cloudflareService;

                summary.push(' └─ ✅ Cloudflare Service ready.');
            } catch (error) {
                logger.error('🔥 FATAL: Failed to initialize Cloudflare Service:', error);
                summary.push(' └─ ❌ FAILED to load Cloudflare Service.');
            }
        });

        return summary;
    },
};
