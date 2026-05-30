/**
 * @namespace: addons/activity/database/models/ActivityLog.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { KythiaModel } = require('kythia-core');

class ActivityLog extends KythiaModel {
	static cacheKeys = [['guildId', 'userId', 'date']];
	static guarded = [];

	static get structure() {
		return {
			options: { timestamps: false },
		};
	}
}

module.exports = ActivityLog;
