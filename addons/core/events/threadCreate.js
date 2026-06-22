/**
 * @namespace: addons/core/events/threadCreate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { AuditLogEvent, ChannelType, MessageFlags } = require('discord.js');
const Sentry = require('@sentry/node');
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
	[ChannelType.GuildDirectory]: 'Directory Channel',
	[ChannelType.GuildStore]: 'Store Channel',
	[ChannelType.DM]: 'Direct Message',
	[ChannelType.GroupDM]: 'Group DM',
};
function humanChannelType(type) {
	if (typeof type === 'string' && channelTypeNames[type])
		return channelTypeNames[type];
	if (typeof type === 'number' && channelTypeNames[type])
		return channelTypeNames[type];
	if (typeof type === 'string') return type;
	if (typeof type === 'number') return `Unknown (${type})`;
	return 'Unknown';
}
const { BaseEvent } = require('kythia-core');
class ThreadCreateEvent extends BaseEvent {
	async execute(thread) {
		const container = this.container;
		const _bot = {
			client: this.client,
			container: this.container,
		};
		if (!thread.guild) return;
		const { kythiaConfig, models, helpers, logger, t } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
		const { convertColor } = helpers.color;
		const guildId = thread.guild.id;
		try {
			const settings = await ServerSetting.getCache({
				guildId: thread.guild.id,
			});
			if (!settings?.auditLogChannelId) return;
			const logChannel = await helpers.discord.getChannelSafe(
				thread.guild,
				settings.auditLogChannelId,
			);
			if (!logChannel?.isTextBased()) return;
			if (
				!logChannel
					.permissionsFor(this.client.user)
					?.has(['ViewChannel', 'SendMessages'])
			)
				return;
			if (!thread.guild.members.me?.permissions?.has('ViewAuditLog')) return;
			const audit = await thread.guild
				.fetchAuditLogs({
					type: AuditLogEvent.ThreadCreate,
					limit: 1,
				})
				.catch(() => null);
			if (!audit) return;
			const entry = audit.entries.find(
				(e) =>
					e.target?.id === thread.id && e.createdTimestamp > Date.now() - 5000,
			);
			if (!entry) return;
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
					'core.events.threadCreate.log',
					{
						id: thread.id,
						threadType: humanChannelType(thread.type),
						parentChannel: thread.parent ? `<#${thread.parent.id}>` : 'None',
						archived: thread.archived ? 'Yes' : 'No',
						locked: thread.locked ? 'Yes' : 'No',
						autoArchiveDuration: thread.autoArchiveDuration,
						reason: entry.reason
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
				label: 'threadCreate',
			});
			if (kythiaConfig?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = ThreadCreateEvent;
