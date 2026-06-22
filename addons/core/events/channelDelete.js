/**
 * @namespace: addons/core/events/channelDelete.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { AuditLogEvent, ChannelType, MessageFlags } = require('discord.js');
const Sentry = require('@sentry/node');
const { BaseEvent } = require('kythia-core');
class ChannelDeleteEvent extends BaseEvent {
	async execute(channel) {
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
		try {
			if (!channel.guild.members.me?.permissions?.has('ViewAuditLog')) return;
			const audit = await channel.guild
				.fetchAuditLogs({
					type: AuditLogEvent.ChannelDelete,
					limit: 1,
				})
				.catch(() => null);
			if (!audit) return;
			let entry = audit.entries.find(
				(e) =>
					e.target?.id === channel.id && e.createdTimestamp > Date.now() - 5000,
			);
			if (!entry) {
				entry = audit.entries.find(
					(e) =>
						e.changes?.some(
							(c) => c.key === 'name' && c.old === channel.name,
						) && e.createdTimestamp > Date.now() - 5000,
				);
			}
			const settings = await ServerSetting.getCache({
				guildId: channel.guild.id,
			});
			if (!settings?.auditLogChannelId || !entry) return;
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
			const executor = entry.executor;
			const channelTypeNames = {
				[ChannelType.GuildText]: 'Text Channel',
				[ChannelType.GuildVoice]: 'Voice Channel',
				[ChannelType.GuildCategory]: 'Category',
				[ChannelType.GuildAnnouncement]: 'Announcement Channel',
				[ChannelType.AnnouncementThread]: 'Announcement Thread',
				[ChannelType.PublicThread]: 'Public Thread',
				[ChannelType.PrivateThread]: 'Private Thread',
				[ChannelType.GuildStageVoice]: 'Stage Channel',
				[ChannelType.GuildForum]: 'Forum Channel',
				[ChannelType.GuildMedia]: 'Media Channel',
			};
			const channelTypeName =
				channelTypeNames[channel.type] || `Unknown (${channel.type})`;
			const components = await simpleContainer(
				{
					client: this.client,
					guildId: channel.guild.id,
				},
				await t(
					{
						client: this.client,
						guildId: channel.guild.id,
					},
					'core.events.channelDelete.log',
					{
						name: channel.name || 'Unknown',
						channelTypeName: channelTypeName,
						reason: entry.reason
							? await t(
									{
										client: this.client,
										guildId: channel.guild.id,
									},
									'core.events.common.reason',
									{
										reason: entry.reason,
									},
								)
							: '',
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
			logger.error(`Error in channelDelete: ${err.message || err}`, {
				label: 'core:events:channelDelete',
			});
			if (kythiaConfig?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = ChannelDeleteEvent;
