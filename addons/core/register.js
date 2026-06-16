/**
 * @namespace: addons/core/register.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const setupTopGGPoster = require('./helpers/topggPoster');

const initialize = (bot) => {
	const container = bot.client.container;
	const { logger } = container;
	const client = bot.client;
	const summary = [];

	// Only run background tasks on Shard 0 to prevent duplicate executions
	const isShardZeroOrNoShard = !client.shard || client.shard.ids.includes(0);

	if (isShardZeroOrNoShard) {
		const topGGPoster = setupTopGGPoster(bot);
		if (topGGPoster) {
			summary.push('  ╰┈➤ Task: Top.gg auto-poster initialized');
			process.on('exit', () => {
				topGGPoster.cleanup();
			});
		}
	} else {
		logger.info(
			`🚫 Core background tasks (Top.gg) disabled on Shard ${client.shard.ids[0]}`,
			{ label: 'core' },
		);
	}

	return summary;
};

module.exports = {
	initialize,
};
