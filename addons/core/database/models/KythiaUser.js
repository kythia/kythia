/**
 * @namespace: addons/core/database/models/KythiaUser.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { KythiaModel } = require('kythia-core');

class KythiaUser extends KythiaModel {
	// static cacheKeys = [["userId"]];
	static customInvalidationTags = ['KythiaUser:leaderboard'];

	static guarded = [];

	static associate(models) {
		if (models.UserPet) {
			this.hasMany(models.UserPet, {
				foreignKey: 'userId',
				as: 'pets',
			});
		}
		if (models.Subdomain) {
			this.hasMany(models.Subdomain, {
				foreignKey: 'userId',
				as: 'subdomains',
				onDelete: 'CASCADE',
			});
		}
		if (models.Monitor) {
			this.hasMany(models.Monitor, {
				foreignKey: 'userId',
				as: 'monitors',
				onDelete: 'CASCADE',
			});
		}
	}
}

module.exports = KythiaUser;
