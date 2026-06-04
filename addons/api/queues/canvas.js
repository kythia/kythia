const path = require('path');

module.exports = {
	queueName: 'kythia-api-canvas-queue',
	processorPath: path.join(__dirname, 'processors', 'canvasProcessor.js'),
	concurrency: 4, // Higher concurrency for API requests
};
