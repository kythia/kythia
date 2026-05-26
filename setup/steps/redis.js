/**
 * @file setup/steps/redis.js
 * @description Setup Step 4 - Redis Cache
 * @copyright © 2026 kenndeclouv
 */

const { ask, confirm, header, hint, warn } = require('../prompt');

module.exports = async (totalSteps = 6) => {
	header(`Step 4 / ${totalSteps}`, '⚡ Redis Cache');

	hint('Get a free Redis instance at: https://redis.io/try-free/');
	warn('Some features will not work without Redis.');

	const useRedis = await confirm('Configure Redis?', true);

	if (!useRedis) {
		warn('Redis disabled. Some caching features will be limited.');
		return { useRedis: false, redisUrls: '' };
	}

	const redisUrls = await ask(
		'Redis URL(s) comma-separated',
		'redis://localhost:6379',
	);

	return { useRedis: true, redisUrls };
};
