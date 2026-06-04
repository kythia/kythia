const path = require('path');

module.exports = {
	queueName: 'kythia-birthday-queue',
	processorPath: path.join(__dirname, 'processors', 'bannerProcessor.js'),
	concurrency: 2,
};
