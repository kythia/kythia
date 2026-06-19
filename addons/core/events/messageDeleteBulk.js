/**
 * @namespace: addons/core/events/messageDeleteBulk.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { AuditLogEvent, MessageFlags } = require('discord.js');
const Sentry = require('@sentry/node');
const { BaseEvent } = require('kythia-core');
class MessageDeleteBulkEvent extends BaseEvent {
	async execute(messages, channel) {
		const container = this.container;
		const _bot = {
			client: this.client,
			container: this.container,
		};
		if (!channel.guild) return;
		const { kythiaConfig, models, helpers, logger, t } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
		const { convertColor } = helpers.color;
		const guildId = channel.guild.id;
		try {
			const settings = await ServerSetting.getCache({
				guildId: channel.guild.id,
			});
			if (!settings?.auditLogChannelId) return;
			const logChannel = await helpers.discord.getChannelSafe(
				channel.guild,
				settings.auditLogChannelId,
			);
			if (!logChannel?.isTextBased()) return;
			if (
				!logChannel
					.permissionsFor(this.client.user)
					?.has(['ViewChannel', 'SendMessages'])
			)
				return;
			if (!channel.guild.members.me?.permissions?.has('ViewAuditLog')) return;
			const audit = await channel.guild
				.fetchAuditLogs({
					type: AuditLogEvent.MessageBulkDelete,
					limit: 1,
				})
				.catch(() => null);
			if (!audit) return;
			const entry = audit.entries.find(
				(e) =>
					e.extra?.channel?.id === channel.id &&
					e.createdTimestamp > Date.now() - 5000,
			);
			if (!entry) return;
			const executor = entry.executor;
			const messageIds = Array.from(messages.keys()).slice(0, 10).join(', ');
			const components = await simpleContainer(
				{
					client: this.client,
					guildId: guildId,
				},
				await t(
					{
						client: this.client,
						guildId: guildId,
					},
					'core.events.messageDeleteBulk.log',
					{
						var0: executor?.id || 'Unknown',
						id: channel.id,
						size: messages.size,
						messageIds: messageIds,
						var4: messages.size > 10 ? '...' : '',
						conditional5: entry.reason
							? await t(
									{
										client: this.client,
										guildId: guildId,
									},
									'core.events.common.reason',
									{
										reason: entry.reason,
									},
								)
							: '',
						var6: executor?.tag || 'Unknown',
						var7: executor?.id || 'Unknown',
						var8: Math.floor(Date.now() / 1000),
					},
				),
				{
					color: convertColor('Red', {
						from: 'discord',
						to: 'decimal',
					}),
					withFooter: true,
				},
			);
			await logChannel.send({
				components,
				flags: MessageFlags.IsComponentsV2,
				allowedMentions: {
					parse: [],
				},
			});
		} catch (err) {
			logger.error(`Error: ${err.message || err}`, {
				label: 'messageDeleteBulk',
			});
			if (kythiaConfig?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = MessageDeleteBulkEvent;
