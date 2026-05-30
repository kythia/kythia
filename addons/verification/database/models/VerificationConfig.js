/**
 * @namespace: addons/verification/database/models/VerificationConfig.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { KythiaModel } = require('kythia-core');

class VerificationConfig extends KythiaModel {
	static cacheKeys = [['guildId']];
	static guarded = [];
}

module.exports = VerificationConfig;
