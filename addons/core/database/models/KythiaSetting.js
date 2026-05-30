/**
 * @namespace: addons/core/database/models/KythiaSetting.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { KythiaModel } = require('kythia-core');

class KythiaSetting extends KythiaModel {
	static cacheKeys = [['guildId']];

	static guarded = [];
}

module.exports = KythiaSetting;
