/**
 * @namespace: addons/api/queues/canvas.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const path = require('node:path');

module.exports = {
	queueName: 'kythia-api-canvas-queue',
	processorPath: path.join(__dirname, 'processors', 'canvasProcessor.js'),
	concurrency: 4, // Higher concurrency for API requests
};
