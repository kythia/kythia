/**
 * @namespace: addons/core/tasks/topggPoster.js
 * @type: Scheduled Task
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
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
        logger.warn('TOPGG_API_KEY is not set. Top.gg auto-posting is disabled.');
        return null;
    }

    try {
        // Initialize the poster
        const poster = AutoPoster(topGGToken, client);

        // Add event listeners
        poster.on('posted', (stats) => {
            logger.info(`✅ Successfully posted stats to Top.gg | Servers: ${stats.serverCount} | Shards: ${stats.shardCount || 1}`);
        });

        poster.on('error', (error) => {
            logger.error('❌ Failed to post stats to Top.gg:', error);
        });

        logger.info('Top.gg auto-poster initialized successfully');
        
        return {
            poster,
            cleanup: () => {
                poster.removeAllListeners('posted');
                poster.removeAllListeners('error');
            }
        };
    } catch (error) {
        logger.error('Failed to initialize Top.gg auto-poster:', error);
        return null;
    }
}

module.exports = setupTopGGPoster;
