/**
 * @namespace: addons/booster/queues/processors/bannerProcessor.js
 * @type: BullMQ Sandboxed Processor
 * @copyright © 2026 kenndeclouv
 */

const { welcomeBanner } = require('kythia-arts');

/**
 * @param {import('bullmq').Job} job
 */
module.exports = async (job) => {
	const { userId, options } = job.data;

	const buffer = await welcomeBanner(userId, options);
	return buffer;
};
