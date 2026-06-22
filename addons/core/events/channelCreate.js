/**
 * @namespace: addons/core/events/channelCreate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { AuditLogEvent, ChannelType, MessageFlags } = require('discord.js');
const Sentry = require('@sentry/node');
const { BaseEvent } = require('kythia-core');
class ChannelCreateEvent extends BaseEvent {
	async execute(channel) {
		const container = this.container;
		const _bot = {
			client: this.client,
			container: this.container,
		};
		if (!channel.guild) return;
		const { kythiaConfig, models, helpers, t, logger } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
		const { convertColor } = helpers.color;
		const guildId = channel.guild.id;
		try {
			if (!channel.guild.members.me?.permissions?.has('ViewAuditLog')) return;
			const audit = await channel.guild
				.fetchAuditLogs({
					type: AuditLogEvent.ChannelCreate,
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
							(c) => c.key === 'name' && c.new === channel.name,
						) && e.createdTimestamp > Date.now() - 5000,
				);
			}
			const settings = await ServerSetting.getCache({
				guildId,
			});
			if (!settings?.auditLogChannelId) return;
			const logChannel = await helpers.discord.getChannelSafe(
				channel.guild,
				settings.auditLogChannelId,
			);
			if (!logChannel?.isTextBased() || !entry) return;
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
					guildId: guildId,
				},
				await t(
					{
						client: this.client,
						guildId: guildId,
					},
					'core.events.channelCreate.log',
					{
						id: channel.id,
						channelTypeName: channelTypeName,
						reason: entry.reason
							? await t(
									{
										client: this.client,
										guildId: guildId,
									},
									'core.helpers.index.events.common.reason',
									{
										reason: entry.reason,
									},
								)
							: '',
						executorTag: executor?.tag || 'Unknown',
						executorId: executor?.id || 'Unknown',
						timestamp: Math.floor(Date.now() / 1000),
					},
				),
				{
					color: convertColor('Green', {
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
				label: 'channelCreate',
			});
			if (kythiaConfig?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = ChannelCreateEvent;
