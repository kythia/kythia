/**
 * @namespace: addons/birthday/queues/processors/banner-processor.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { welcomeBanner, loadFonts } = require('kythia-arts');

const path = require('node:path');
// Initialize fonts for this worker process
loadFonts(path.join(process.cwd(), 'addons', 'core', 'assets', 'fonts'));

/**
 * @param {import('bullmq').Job} job
 */
module.exports = async (job) => {
	const { userId, options } = job.data;

	const buffer = await welcomeBanner(userId, options);
	return buffer;
};
