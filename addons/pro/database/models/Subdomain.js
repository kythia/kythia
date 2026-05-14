/**
 * @namespace: addons/pro/database/models/Subdomain.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { KythiaModel } = require('kythia-core');

class Subdomain extends KythiaModel {
	static cacheKeys = [['domain'], ['userId']];
	static guarded = [];

	static associate(models) {
		if (models.KythiaUser) {
			this.belongsTo(models.KythiaUser, {
				foreignKey: 'userId',
				as: 'kythiaUser',
			});
		}
		if (models.DnsRecord) {
			this.hasMany(models.DnsRecord, {
				foreignKey: 'subdomainId',
				as: 'dnsRecords',
				onDelete: 'CASCADE',
			});
		}
	}

	static get structure() {
		return {
			options: { timestamps: true },
		};
	}
}

module.exports = Subdomain;
