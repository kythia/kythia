/**
 * @namespace: addons/core/events/channelPinsUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	AuditLogEvent,
	MessageFlags,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
const { BaseEvent } = require('kythia-core');
class ChannelPinsUpdateEvent extends BaseEvent {
	async execute(channel, _time) {
		const container = this.container;
		if (!channel.guild) return;
		const { models, helpers, t, logger } = container;
		const { ServerSetting } = models;
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
			const components = [
				new ContainerBuilder()
					.setAccentColor(
						convertColor(isPinned ? 'Green' : 'Orange', {
							from: 'discord',
							to: 'decimal',
						}),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`📌 **Message ${isPinned ? 'Pinned' : 'Unpinned'}** by <@${executor?.id || 'Unknown'}>\n\n` +
								`**Channel:** <#${channel.id}>\n` +
								`**Message ID:** ${entry.extra?.messageId || 'Unknown'}` +
								(entry.reason ? `\n\n**Reason:** ${entry.reason}` : ''),
						),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`👤 **Executor:** ${executor?.tag || 'Unknown'} (${executor?.id || 'Unknown'})\n` +
								`🕒 **Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>`,
						),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							await t(
								{
									guildId,
								},
								'common.container.footer',
								{
									username: this.client.user.username,
								},
							),
						),
					),
			];
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
