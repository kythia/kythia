/**
 * @namespace: addons/welcomer/queues/banner.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { BaseQueue } = require('kythia-core');
const path = require('node:path');

class BannerQueue extends BaseQueue {
	queueName = 'kythia-welcomer-queue';
	processorPath = path.join(__dirname, 'processors', 'banner-processor.js');
	concurrency = 2;
}

exports.default = BannerQueue;
