/**
 * @namespace: addons/leveling/queues/image.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { BaseQueue } = require('kythia-core');
const path = require('node:path');

class ImageQueue extends BaseQueue {
	queueName = 'kythia-image-queue';
	processorPath = path.join(__dirname, 'processors', 'image-processor.js');
	concurrency = 2;
}

exports.default = ImageQueue;
