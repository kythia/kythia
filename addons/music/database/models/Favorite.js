/**
 * @namespace: addons/music/database/models/Favorite.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { KythiaModel } = require('kythia-core');

class Favorite extends KythiaModel {
	static cacheKeys = [['userId']];
	static guarded = [];

	static get structure() {
		return {
			options: { timestamps: true },
		};
	}
}

module.exports = Favorite;
