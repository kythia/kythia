/**
 * @namespace: addons/music/database/models/Music247.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { KythiaModel } = require('kythia-core');

class Music247 extends KythiaModel {
	static cacheKeys = [['guildId']];
	static guarded = [];
	static table = 'music_247_status';

	static get structure() {
		return {
			options: { timestamps: true },
		};
	}
}

module.exports = Music247;
