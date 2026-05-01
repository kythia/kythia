/**
 * @namespace: addons/server-stats/tasks/stats-updater.js
 * @type: Scheduled Task
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { runStatsUpdater } = require('../helpers/stats');

module.exports = {
	taskName: 'server-stats-updater',
	schedule: '*/5 * * * *',
	active: true,

	execute: async (container) => {
		const { client } = container;

		// Only run on Shard 0 to prevent duplicate executions across shards
		if (client.shard && !client.shard.ids.includes(0)) {
			return;
		}

		await runStatsUpdater(client);
	},
};
