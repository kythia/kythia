/**
 * @namespace: addons/ai/database/models/UserFact.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { KythiaModel } = require('kythia-core');

class UserFact extends KythiaModel {
	static cacheKeys = [['userId']];
	static guarded = [];

	static get structure() {
		return {
			attributes: {},
			options: { timestamps: true },
		};
	}
}

module.exports = UserFact;
