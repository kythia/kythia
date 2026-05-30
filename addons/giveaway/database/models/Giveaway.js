/**
 * @namespace: addons/giveaway/database/models/Giveaway.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { KythiaModel } = require('kythia-core');

class Giveaway extends KythiaModel {
	static cacheKeys = [['messageId']];
	static guarded = [];

	static get structure() {
		return {
			options: { timestamps: false },
		};
	}
}

module.exports = Giveaway;
