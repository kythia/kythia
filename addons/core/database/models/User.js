/**
 * @namespace: addons/core/database/models/User.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { KythiaModel } = require('kythia-core');

class User extends KythiaModel {
	static cacheKeys = [['userId', 'guildId']];
	static customInvalidationTags = ['User:leaderboard'];

	static guarded = [];
}

module.exports = User;
