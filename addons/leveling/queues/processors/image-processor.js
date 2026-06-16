/**
 * @namespace: addons/leveling/queues/processors/image-processor.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { rankCard, achievementBanner } = require('kythia-arts');

/**
 * @param {import('bullmq').Job} job
 */
module.exports = async (job) => {
	const { type, userId, options } = job.data;

	if (type === 'profileImage') {
		const buffer = await rankCard(userId, options);
		// BullMQ serializes the Buffer to { type: 'Buffer', data: [...] }
		// — reconstruct on the main thread with Buffer.from(result.data)
		return buffer;
	}

	if (type === 'achievementBanner') {
		const buffer = await achievementBanner(userId, options);
		return buffer;
	}

	throw new Error(`Unknown job type for leveling imageProcessor: ${type}`);
};
