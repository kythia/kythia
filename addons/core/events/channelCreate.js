/**
 * @namespace: addons/core/events/channelCreate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	AuditLogEvent,
	ChannelType,
	MessageFlags,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
const Sentry = require('@sentry/node');

const { BaseEvent } = require('kythia-core');

class ChannelCreateEvent extends BaseEvent {
	async execute(channel) {
		const container = this.container;
		const bot = { client: this.client, container: this.container };

		if (!channel.guild) return;
		const { models, helpers, t, logger } = container;
		const { ServerSetting } = models;
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

			const settings = await ServerSetting.getCache({ guildId });
			if (!settings?.auditLogChannelId) return;

			const logChannel = await channel.guild.channels
				.fetch(settings.auditLogChannelId)
				.catch(() => null);
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

			const components = [
				new ContainerBuilder()
					.setAccentColor(
						convertColor('Green', { from: 'discord', to: 'decimal' }),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`➕ **Channel Created** by <@${executor?.id || 'Unknown'}>\n\n` +
								`**Channel:** <#${channel.id}>\n` +
								`**Type:** ${channelTypeName}` +
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
							await t({ guildId }, 'common.container.footer', {
								username: this.client.user.username,
							}),
						),
					),
			];

			await logChannel.send({
				components,
				flags: MessageFlags.IsComponentsV2,
				allowedMentions: { parse: [] },
			});
		} catch (err) {
			logger.error(`Error: ${err.message || err}`, {
				label: 'channelCreate',
			});
			if (bot.config?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}

module.exports = ChannelCreateEvent;
