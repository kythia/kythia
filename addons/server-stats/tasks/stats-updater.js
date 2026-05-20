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

		// Runs on all shards. The helper filters by client.guilds.cache.get()
		// which ensures each shard only updates its own guilds.

		await runStatsUpdater(client);
	},
};
