/**
 * @namespace: addons/nsfw/database/models/NsfwUser.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { KythiaModel } = require('kythia-core');

class NsfwUser extends KythiaModel {
	static guarded = [];

	static associate(models) {
		if (models.KythiaUser) {
			this.belongsTo(models.KythiaUser, {
				foreignKey: 'userId',
				as: 'user',
			});
		}
	}
}

module.exports = NsfwUser;
