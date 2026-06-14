/**
 * @namespace: addons/server-stats/tasks/stats-updater.js
 * @type: Scheduled Task
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { runStatsUpdater } = require('../helpers/stats');

const { BaseTask } = require('kythia-core');

class StatsUpdaterTask extends BaseTask {
	task = {
		taskName: 'server-stats-updater',
		schedule: '*/5 * * * *',
		active: true,
	};

	async execute(container) {
		const { client } = container || this.container;

		// Runs on all shards. The helper filters by client.guilds.cache.get()
		// which ensures each shard only updates its own guilds.

		await runStatsUpdater(client);
	}
}

exports.default = StatsUpdaterTask;
