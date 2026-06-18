/**
 * @namespace: addons/core/events/threadDelete.js
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
class ThreadDeleteEvent extends BaseEvent {
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
					type: AuditLogEvent.ThreadDelete,
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
				`**Thread Deleted** by <@${executor?.id || 'Unknown'}>\n\n` +
					`**Thread Name:** ${thread.name}\n` +
					`**Type:** ${humanChannelType(thread.type)}\n` +
					`**Parent Channel:** ${thread.parent ? `<#${thread.parent.id}>` : 'None'}\n` +
					`**Archived:** ${thread.archived ? 'Yes' : 'No'}\n` +
					`**Locked:** ${thread.locked ? 'Yes' : 'No'}\n` +
					`**Auto Archive Duration:** ${thread.autoArchiveDuration} minutes` +
					(entry.reason ? `\n\n**Reason:** ${entry.reason}` : '') +
					'\n\n' +
					(`**Executor:** ${executor?.tag || 'Unknown'} (${executor?.id || 'Unknown'})\n` +
						`**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>`),
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
				label: 'threadDelete',
			});
			if (kythiaConfig?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = ThreadDeleteEvent;
