/**
 * @namespace: addons/economy/database/models/MarketTransaction.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { KythiaModel } = require('kythia-core');

class MarketTransaction extends KythiaModel {
	static guarded = [];

	static get structure() {
		return {
			attributes: {},
			options: { timestamps: true },
		};
	}
}

module.exports = MarketTransaction;
