/**
 * @namespace: addons/autoreply/database/models/AutoReply.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { KythiaModel } = require('kythia-core');

class AutoReply extends KythiaModel {
	static guarded = [];

	// Define cache keys for efficient lookups
	static cacheKeys = [['guildId'], ['guildId', 'trigger']];
	static customInvalidationTags = ['AutoReply:list'];
}

module.exports = AutoReply;
