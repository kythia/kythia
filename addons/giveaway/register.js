/**
 * @namespace: addons/giveaway/register.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const GiveawayManager = require('./helpers/GiveawayManager');

module.exports = {
	initialize(bot) {
		const container = bot.client.container;
		const client = bot.client;
		const summary = [];

		// Inject GiveawayManager into the container for use by commands/events
		container.giveawayManager = new GiveawayManager(container);

		// Scheduler only on Shard 0 — prevents multiple shards ending the same giveaway
		const isShardZeroOrNoShard = !client.shard || client.shard.ids.includes(0);
		if (isShardZeroOrNoShard) {
			bot.addClientReadyHook(async () => {
				await container.giveawayManager.init();
			});
			summary.push(
				'   ╰┈➤ 🎁 Giveaway Manager (Scheduler Queued, Shard 0 only)',
			);
		} else {
			summary.push(
				'   ╰┈➤ 🎁 Giveaway Manager (Scheduler skipped on this shard)',
			);
		}

		return summary;
	},
};
