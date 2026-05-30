/**
 * @namespace: addons/economy/database/models/FleaMarketListing.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { KythiaModel } = require('kythia-core');

class FleaMarketListing extends KythiaModel {
	static cacheKeys = [['id']];
	static guarded = [];
	static table = 'kythia_flea_market';

	static associate(models) {
		if (models.KythiaUser) {
			this.belongsTo(models.KythiaUser, {
				foreignKey: 'sellerId',
				targetKey: 'userId',
				as: 'seller',
			});
		}
	}
}

module.exports = FleaMarketListing;
