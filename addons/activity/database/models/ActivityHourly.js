/**
 * @namespace: addons/activity/database/models/ActivityHourly.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { KythiaModel } = require('kythia-core');

class ActivityHourly extends KythiaModel {
	static table = 'activity_hourly';
	static cacheKeys = [['guildId', 'dayOfWeek', 'hour']];
	static guarded = [];

	static get structure() {
		return {
			options: { timestamps: false, tableName: 'activity_hourly' },
		};
	}
}

module.exports = ActivityHourly;
