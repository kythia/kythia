const path = require('path');

module.exports = {
	queueName: 'kythia-booster-queue',
	processorPath: path.join(__dirname, 'processors', 'bannerProcessor.js'),
	concurrency: 2,
};
