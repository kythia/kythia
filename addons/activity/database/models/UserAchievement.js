/**
 * @namespace: addons/activity/database/models/UserAchievement.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { KythiaModel } = require('kythia-core');

class UserAchievement extends KythiaModel {
	static cacheKeys = [['guildId', 'userId', 'achievementId']];
	static guarded = [];

	static get structure() {
		return {
			options: { timestamps: false },
		};
	}
}

module.exports = UserAchievement;
