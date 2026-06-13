/**
 * @namespace: addons/core/database/models/PremiumServerBind.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { KythiaModel } = require('kythia-core');

class PremiumServerBind extends KythiaModel {
	static tableName = 'premium_server_binds';
	static cacheKeys = [['guildId'], ['userId']];
	static guarded = [];
}

module.exports = PremiumServerBind;
