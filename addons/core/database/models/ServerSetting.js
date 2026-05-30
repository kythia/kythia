/**
 * @namespace: addons/core/database/models/ServerSetting.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

// koneksi sequelize
const { KythiaModel } = require('kythia-core');

class ServerSetting extends KythiaModel {
	static cacheKeys = [['guildId']];

	static guarded = [];
}

module.exports = ServerSetting;
