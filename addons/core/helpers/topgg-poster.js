/**
 * @namespace: addons/core/helpers/topgg-poster.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { AutoPoster } = require('topgg-autoposter');

/**
 * Task to post server count to Top.gg
 * @param {Client} client - The Discord.js client instance
 * @returns {Object} Object containing the poster instance and cleanup function
 */
function setupTopGGPoster(bot) {
	// Get Top.gg token from environment variables
	const topGGToken = process.env.TOPGG_API_KEY;
	const client = bot.client;
	const logger = bot.container.logger;

	if (!topGGToken) {
		logger.warn(`TOPGG_API_KEY is not set. Top.gg auto-posting is disabled.`, {
			label: 'core',
		});
		return null;
	}

	try {
		// Initialize the poster
		const poster = AutoPoster(topGGToken, client);

		// Override getStats to ensure we post the total server count across all shards
		poster.getStats = async () => {
			let serverCount = client.guilds.cache.size;

			if (client.shard) {
				const shardInfo = await client.shard.broadcastEval(
					(c) => c.guilds.cache.size,
				);
				serverCount = shardInfo.reduce((acc, count) => acc + count, 0);
			}

			return {
				serverCount,
				shardCount: client.options?.shardCount || 1,
			};
		};

		// Add event listeners
		poster.on('posted', (stats) => {
			logger.info(
				`✅ Successfully posted stats to Top.gg | Servers: ${stats.serverCount} | Shards: ${stats.shardCount || 1}`,
				{ label: 'core' },
			);
		});

		poster.on('error', (error) => {
			logger.error(
				`Failed to post stats to Top.gg: ${error.message || error}`,
				{
					label: 'topgg',
				},
			);
		});

		logger.info(`Top.gg auto-poster initialized successfully`, {
			label: 'core',
		});

		return {
			poster,
			cleanup: () => {
				poster.removeAllListeners('posted');
				poster.removeAllListeners('error');
			},
		};
	} catch (error) {
		logger.error(
			`Failed to initialize Top.gg auto-poster: ${error.message || error}`,
			{
				label: 'core',
			},
		);
		return null;
	}
}

module.exports = setupTopGGPoster;
