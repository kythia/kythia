/**
 * @namespace: addons/core/events/guildScheduledEventCreate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { AuditLogEvent, MessageFlags } = require('discord.js');
const Sentry = require('@sentry/node');
const { BaseEvent } = require('kythia-core');
class GuildScheduledEventCreateEvent extends BaseEvent {
	async execute(scheduledEvent) {
		const container = this.container;
		const _bot = {
			client: this.client,
			container: this.container,
		};
		if (!scheduledEvent.guild) return;
		const { kythiaConfig, models, helpers, logger, t } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
		const { convertColor } = helpers.color;
		const guildId = scheduledEvent.guild.id;
		try {
			const settings = await ServerSetting.getCache({
				guildId: scheduledEvent.guild.id,
			});
			if (!settings?.auditLogChannelId) return;
			const logChannel = await helpers.discord.getChannelSafe(
				scheduledEvent.guild,
				settings.auditLogChannelId,
			);
			if (!logChannel?.isTextBased()) return;
			if (
				!logChannel
					.permissionsFor(this.client.user)
					?.has(['ViewChannel', 'SendMessages'])
			)
				return;
			if (!scheduledEvent.guild.members.me?.permissions?.has('ViewAuditLog'))
				return;
			const audit = await scheduledEvent.guild
				.fetchAuditLogs({
					type: AuditLogEvent.GuildScheduledEventCreate,
					limit: 1,
				})
				.catch(() => null);
			if (!audit) return;
			const entry = audit.entries.find(
				(e) =>
					e.target?.id === scheduledEvent.id &&
					e.createdTimestamp > Date.now() - 5000,
			);
			if (!entry) return;
			const executor = entry.executor;
			const components = await simpleContainer(
				{
					client: this.client,
					guildId: guildId,
				},
				`**Scheduled Event Created** by <@${executor?.id || 'Unknown'}>\n\n` +
					`**Event:** ${scheduledEvent.name}\n` +
					`**Description:** ${scheduledEvent.description || 'No description'}\n` +
					`**Start Time:** <t:${Math.floor(scheduledEvent.scheduledStartTimestamp / 1000)}:F>\n` +
					`**Location:** ${scheduledEvent.channel ? `<#${scheduledEvent.channel.id}>` : scheduledEvent.entityMetadata?.location || 'External'}\n` +
					`**Interested Count:** ${scheduledEvent.userCount || 0}` +
					(entry.reason ? `\n\n**Reason:** ${entry.reason}` : '') +
					'\n\n' +
					(`**Executor:** ${executor?.tag || 'Unknown'} (${executor?.id || 'Unknown'})\n` +
						`**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>`),
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
				label: 'guildScheduledEventCreate',
			});
			if (kythiaConfig?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = GuildScheduledEventCreateEvent;
