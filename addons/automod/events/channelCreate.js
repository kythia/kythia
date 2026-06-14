/**
 * @namespace: addons/automod/events/channelCreate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { AuditLogEvent } = require('discord.js');
const { checkThreshold } = require('../helpers/antinuke');

const { BaseEvent } = require('kythia-core');

class ChannelCreateEvent extends BaseEvent {
	async execute(channel) {
		const _container = this.container;
		const bot = { client: this.client, container: this.container };

		if (!channel.guild) return;

		try {
			if (!channel.guild.members.me?.permissions?.has('ViewAuditLog')) return;
			const audit = await channel.guild
				.fetchAuditLogs({
					type: AuditLogEvent.ChannelCreate,
					limit: 1,
				})
				.catch(() => null);
			if (!audit) return;
			const entry = audit.entries.find(
				(e) =>
					e.target?.id === channel.id && e.createdTimestamp > Date.now() - 5000,
			);
			if (!entry?.executor) return;

			await checkThreshold({
				bot,
				guild: channel.guild,
				executor: entry.executor,
				moduleName: 'channelCreate',
				detail: `Created channel: ${channel.name}`,
			});
		} catch (err) {
			this.container.logger.error(
				`channelCreate error: ${err.message || err}`,
				{
					label: 'antinuke',
				},
			);
		}
	}
}

module.exports = ChannelCreateEvent;
