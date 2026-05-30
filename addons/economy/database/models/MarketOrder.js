/**
 * @namespace: addons/economy/database/models/MarketOrder.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { KythiaModel } = require('kythia-core');

class MarketOrder extends KythiaModel {
	static guarded = [];

	static get structure() {
		return {
			options: { timestamps: true },
		};
	}
}

module.exports = MarketOrder;
