const path = require('path');

module.exports = {
	queueName: 'kythia-welcomer-queue',
	processorPath: path.join(__dirname, 'processors', 'bannerProcessor.js'),
	concurrency: 2,
};
