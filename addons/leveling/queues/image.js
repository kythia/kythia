/**
 * @namespace: addons/leveling/queues/image.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const path = require('node:path');

module.exports = {
	queueName: 'kythia-image-queue',
	processorPath: path.join(__dirname, 'processors', 'imageProcessor.js'),
	concurrency: 2,
};
