/**
 * @namespace: addons/economy/tasks/order-processor.js
 * @type: Scheduled Task
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { processOrders } = require('../helpers/orderProcessor');

const { BaseTask } = require('kythia-core');

class OrderProcessorTask extends BaseTask {
	task = {
		taskName: 'economy-order-processor',
		// Fallback interval if missing from config
		schedule: '*/5 * * * *',
		active: true,

		// Optional: read schedule from config dynamically during load if supported,
		// but static 'schedule' property is usually expected by the Task Loader.
		// Since orderProcessorSchedule was previously checked from kythiaConfig in initializeOrderProcessing,
		// we use */5 * * * * as the standard base. (Container provides kythiaConfig at execute time).
	};

	async execute(container) {
		const { client } = container || this.container;

		// Only run on Shard 0 to prevent duplicate order executions across shards
		if (client.shard && !client.shard.ids.includes(0)) {
			return;
		}

		// Because processOrders expects `bot` and destructures `bot.container`,
		// but Kythia tasks pass `container` directly, we can wrap it simply:
		const dummyBot = {
			client,
			container,
		};

		await processOrders(dummyBot);
	}
}

exports.default = OrderProcessorTask;
