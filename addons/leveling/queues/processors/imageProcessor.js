/**
 * @namespace: addons/leveling/queues/processors/imageProcessor.js
 * @type: BullMQ Sandboxed Processor
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 *
 * @description
 * Sandboxed BullMQ processor for leveling image generation.
 * This runs in a SEPARATE THREAD from the main bot process — so heavy
 * Canvas operations here will NOT block the event loop.
 */

const { profileImage, achievementBanner } = require('kythia-arts');

/**
 * @param {import('bullmq').Job} job
 */
module.exports = async (job) => {
	const { type, userId, options } = job.data;

	if (type === 'profileImage') {
		const buffer = await profileImage(userId, options);
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
