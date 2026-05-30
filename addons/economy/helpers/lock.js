const Redis = require('ioredis');

// Ensure we only create one connection per process
let redisClient = null;

function getRedisClient() {
	if (!redisClient) {
		let url =
			process.env.REDIS_URLS ||
			process.env.REDIS_URL ||
			'redis://localhost:6379';
		if (url.includes(',')) url = url.split(',')[0];
		redisClient = new Redis(url);
	}
	return redisClient;
}

/**
 * Acquire a distributed lock.
 * @param {string} key Lock key name.
 * @param {number} ttl Time to live in ms.
 * @returns {Promise<boolean>} True if acquired, false otherwise.
 */
async function acquireLock(key, ttl = 5000) {
	const redis = getRedisClient();
	const acquired = await redis.set(key, 'LOCKED', 'PX', ttl, 'NX');
	return acquired === 'OK';
}

/**
 * Release a distributed lock.
 * @param {string} key Lock key name.
 */
async function releaseLock(key) {
	const redis = getRedisClient();
	await redis.del(key);
}

/**
 * Wait until a lock is acquired.
 * @param {string} key Lock key name.
 * @param {number} retryDelay Delay between retries in ms.
 * @param {number} maxWait Max wait time before throwing an error.
 */
async function waitAndAcquireLock(key, retryDelay = 200, maxWait = 10000) {
	const start = Date.now();
	while (Date.now() - start < maxWait) {
		if (await acquireLock(key, maxWait)) {
			return true;
		}
		await new Promise((resolve) => setTimeout(resolve, retryDelay));
	}
	throw new Error(`Failed to acquire lock for ${key} after ${maxWait}ms`);
}

module.exports = {
	acquireLock,
	releaseLock,
	waitAndAcquireLock,
};
