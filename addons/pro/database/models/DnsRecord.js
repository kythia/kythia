/**
 * @namespace: addons/pro/database/models/DnsRecord.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { KythiaModel } = require('kythia-core');

class DnsRecord extends KythiaModel {
	static cacheKeys = [['subdomainId']];
	static guarded = [];

	static associate(models) {
		if (models.Subdomain) {
			this.belongsTo(models.Subdomain, {
				foreignKey: 'subdomainId',
				as: 'subdomain',
			});
		}
	}

	static get structure() {
		return {
			options: { timestamps: false },
		};
	}
}

module.exports = DnsRecord;
