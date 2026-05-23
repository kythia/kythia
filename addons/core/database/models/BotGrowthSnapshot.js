/**
 * @namespace: addons/core/database/models/BotGrowthSnapshot.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { KythiaModel } = require('kythia-core');

class BotGrowthSnapshot extends KythiaModel {
	static guarded = [];
	static table = 'bot_growth_snapshots';

	static get structure() {
		return {
			options: { timestamps: true },
		};
	}
}

module.exports = BotGrowthSnapshot;
