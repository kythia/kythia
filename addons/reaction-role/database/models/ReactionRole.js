/**
 * @namespace: addons/reaction-role/database/models/ReactionRole.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { KythiaModel } = require('kythia-core');

class ReactionRole extends KythiaModel {
	static cacheKeys = [['messageId', 'emoji'], ['messageId'], ['guildId']];
	static guarded = [];
}

module.exports = ReactionRole;
