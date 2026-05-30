/**
 * @namespace: addons/automod/database/models/ModLog.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { KythiaModel } = require('kythia-core');

class ModLog extends KythiaModel {
	static cacheKeys = [['guildId']];
	static guarded = [];
}

module.exports = ModLog;
