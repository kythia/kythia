/**
 * @namespace: addons/booster/queues/banner.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const path = require('node:path');

module.exports = {
	queueName: 'kythia-booster-queue',
	processorPath: path.join(__dirname, 'processors', 'bannerProcessor.js'),
	concurrency: 2,
};
