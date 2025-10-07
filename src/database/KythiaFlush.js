/**
 * 💥 Flush Redis Cache
 * 
 * @file src/database/KythiaFlush.js
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 * 
 * @description
 * A simple utility script to connect to Redis and run FLUSHALL.
 * Perfect for clearing the cache during development after making
 * breaking changes to data structures.
 */
require('dotenv').config();
require('../../kythia.config.js');

require('module-alias/register');

const Redis = require('ioredis');
const logger = require('@utils/logger');

// Ensure Redis configuration exists in the global config
if (!kythia.db.redis) {
    logger.error('❌ Redis configuration not found in the config file.');
    process.exit(1);
}

// Create a new Redis connection with the same configuration as the bot
const redis = new Redis(kythia.db.redis);

// Wrap in an async function for clarity
const flushCache = async () => {
    let success = false;
    logger.info('💥 Initiating cache flush...');

    redis.on('error', (err) => {
        logger.error('❌ Failed to connect to Redis:', err);
        process.exit(1);
    });

    try {
        logger.info('✅ Successfully connected to the Redis server.');

        logger.warn('🔥 Executing FLUSHALL... All cached data will be deleted!');
        await redis.flushall();

        logger.info('✅ Cache successfully flushed. All keys have been removed.');
        success = true;
    } catch (error) {
        logger.error('❌ An error occurred while flushing the cache:', error);
    } finally {
        // Always close the connection when finished
        redis.disconnect();
        logger.info('🔌 Redis connection closed.');
        process.exit(success ? 0 : 1);
    }
};

// Execute immediately
flushCache();
