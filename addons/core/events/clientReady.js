/**
 * @namespace: addons/core/events/clientReady.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { ActivityType } = require('discord.js');

function setBotPresence(client) {
	const { logger, kythiaConfig } = client.container;
	if (!client.isReady() || client.ws.shards.size === 0) return;

	if (!client.user) {
		logger.error(`client.user is undefined, cannot set presence.`, {
			label: 'clientReady',
		});
		return;
	}

	try {
		let activityType = ActivityType[kythiaConfig.bot.activityType];
		if (activityType === undefined) {
			logger.warn(
				`Invalid activityType '${kythiaConfig.bot.activityType}', defaulting to 'Playing'.`,
				{ label: 'clientReady' },
			);
			activityType = ActivityType.Playing;
		}
		client.user.setPresence({
			activities: [
				{
					name: kythiaConfig.bot.activity,
					type: activityType,
					url: kythiaConfig.bot.streakUrl || null,
				},
			],
			status: kythiaConfig.bot.status || 'online',
		});
		logger.info(`✅ Bot presence has been set.`, { label: 'core' });
	} catch (err) {
		logger.error(`Failed to set bot presence: ${err.message || err}`, {
			label: 'clientReady',
		});
	}
}

const { BaseEvent } = require('kythia-core');

class ClientReadyEvent extends BaseEvent {
	execute(client) {
		const _container = this.container;
		const _bot = { client: this.client, container: this.container };

		setBotPresence(client);

		const { logger } = this.container;
		const readyTime = process.uptime().toFixed(2);
		logger.info(`✅ Bot ready in ${readyTime} seconds.`, { label: 'core' });
	}
}

module.exports = ClientReadyEvent;
