/**
 * @namespace: addons/reaction-role/database/models/ReactionRolePanel.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */
const { KythiaModel } = require('kythia-core');

class ReactionRolePanel extends KythiaModel {
	static cacheKeys = [['guildId', 'name'], ['messageId']];
	static guarded = [];
}

module.exports = ReactionRolePanel;
