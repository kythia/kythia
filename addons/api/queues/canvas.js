/**
 * @namespace: addons/api/queues/canvas.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { BaseQueue } = require('kythia-core');
const path = require('node:path');

class CanvasQueue extends BaseQueue {
	queueName = 'kythia-api-canvas-queue';
	processorPath = path.join(__dirname, 'processors', 'canvas-processor.js');
	concurrency = 4;
	// Higher concurrency for API requests;
}

exports.default = CanvasQueue;
