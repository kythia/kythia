/**
 * @namespace: addons/core/events/guildScheduledEventCreate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const {
	AuditLogEvent,
	MessageFlags,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
const Sentry = require('@sentry/node');

module.exports = async (bot, scheduledEvent) => {
	if (!scheduledEvent.guild) return;
	const container = bot.client.container;
	const { models, helpers, logger, t } = container;
	const { ServerSetting } = models;
	const { convertColor } = helpers.color;
	const guildId = scheduledEvent.guild.id;

	try {
		const settings = await ServerSetting.getCache({
			guildId: scheduledEvent.guild.id,
		});
		if (!settings?.auditLogChannelId) return;

		const logChannel = await scheduledEvent.guild.channels
			.fetch(settings.auditLogChannelId)
			.catch(() => null);
		if (!logChannel?.isTextBased()) return;
		if (
			!logChannel
				.permissionsFor(bot.client.user)
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
		const components = [
			new ContainerBuilder()
				.setAccentColor(
					convertColor('Green', { from: 'discord', to: 'decimal' }),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`📅 **Scheduled Event Created** by <@${executor?.id || 'Unknown'}>\n\n` +
							`**Event:** ${scheduledEvent.name}\n` +
							`**Description:** ${scheduledEvent.description || 'No description'}\n` +
							`**Start Time:** <t:${Math.floor(scheduledEvent.scheduledStartTimestamp / 1000)}:F>\n` +
							`**Location:** ${scheduledEvent.channel ? `<#${scheduledEvent.channel.id}>` : scheduledEvent.entityMetadata?.location || 'External'}\n` +
							`**Interested Count:** ${scheduledEvent.userCount || 0}` +
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
							username: bot.client.user.username,
						}),
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
			label: 'guildScheduledEventCreate',
		});
		if (bot.config?.sentry?.dsn) {
			Sentry.captureException(err);
		}
	}
};
