/**
 * @namespace: addons/minecraft/tasks/mcstats-updater.js
 * @type: Scheduled Task
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { runMinecraftStatsUpdater } = require('../helpers/mcstats');

const { BaseTask } = require('kythia-core');

class McstatsUpdaterTask extends BaseTask {
	task = {
		taskName: 'mcstats-updater',
		schedule: '*/5 * * * *',
		active: true,
	};

	async execute(container) {
		const { client } = container || this.container;

		// Runs on all shards. The helper filters by client.guilds.cache.get()
		// which ensures each shard only updates its own guilds.

		await runMinecraftStatsUpdater(client);
	}
}

exports.default = McstatsUpdaterTask;
