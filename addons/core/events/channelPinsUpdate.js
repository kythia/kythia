/**
 * @namespace: addons/core/events/channelPinsUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { AuditLogEvent, MessageFlags } = require('discord.js');
const { BaseEvent } = require('kythia-core');
class ChannelPinsUpdateEvent extends BaseEvent {
	async execute(channel, _time) {
		const container = this.container;
		if (!channel.guild) return;
		const { models, helpers, t, logger } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
		const { convertColor } = helpers.color;
		const guildId = channel.guild.id;
		try {
			const settings = await ServerSetting.getCache({
				guildId,
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

			// Try to determine if it was a pin or unpin
			if (!channel.guild.members.me?.permissions?.has('ViewAuditLog')) return;
			const pinAudit = await channel.guild
				.fetchAuditLogs({
					type: AuditLogEvent.MessagePin,
					limit: 1,
				})
				.catch(() => null);
			if (!pinAudit) return;
			if (!channel.guild.members.me?.permissions?.has('ViewAuditLog')) return;
			const unpinAudit = await channel.guild
				.fetchAuditLogs({
					type: AuditLogEvent.MessageUnpin,
					limit: 1,
				})
				.catch(() => null);
			if (!unpinAudit) return;
			const pinEntry = pinAudit.entries.find(
				(e) =>
					e.extra?.channel?.id === channel.id &&
					e.createdTimestamp > Date.now() - 5000,
			);
			const unpinEntry = unpinAudit.entries.find(
				(e) =>
					e.extra?.channel?.id === channel.id &&
					e.createdTimestamp > Date.now() - 5000,
			);
			const entry = pinEntry || unpinEntry;
			if (!entry) return;
			const isPinned = !!pinEntry;
			const executor = entry.executor;
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
					'core.events.channelPinsUpdate.log',
					{
						var0: isPinned ? 'Pinned' : 'Unpinned',
						var1: executor?.id || 'Unknown',
						id: channel.id,
						var3: entry.extra?.messageId || 'Unknown',
						conditional4: entry.reason
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
						var5: executor?.tag || 'Unknown',
						var6: executor?.id || 'Unknown',
						var7: Math.floor(Date.now() / 1000),
					},
				),
				{
					color: convertColor(isPinned ? 'Green' : 'Orange', {
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
				label: 'channelPinsUpdate',
			});
		}
	}
}
module.exports = ChannelPinsUpdateEvent;
