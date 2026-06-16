/**
 * @namespace: addons/birthday/queues/processors/banner-processor.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
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
