/**
 * @namespace: addons/core/events/applicationCommandPermissionsUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	AuditLogEvent,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
const Sentry = require('@sentry/node');

module.exports = async (bot, data) => {
	const container = bot.client.container;
	const { helpers, models, logger, t } = container;
	const { convertColor } = helpers.color;
	const { ServerSetting } = models;

	const guildId = data.guildId;
	if (!guildId) return;

	try {
		const guild = await bot.client.guilds.fetch(guildId).catch(() => null);
		if (!guild) return;

		const settings = await ServerSetting.getCache({
			guildId: guild.id,
		});
		if (!settings?.auditLogChannelId) return;

		const logChannel = await guild.channels
			.fetch(settings.auditLogChannelId)
			.catch(() => null);
		if (!logChannel?.isTextBased()) return;
		if (
			!logChannel
				.permissionsFor(bot.client.user)
				?.has(['ViewChannel', 'SendMessages'])
		)
			return;

		// Fetch audit log
		if (!guild.members.me?.permissions?.has('ViewAuditLog')) return;
		const audit = await guild
			.fetchAuditLogs({
				type: AuditLogEvent.ApplicationCommandPermissionUpdate,
				limit: 1,
			})
			.catch(() => null);
		if (!audit) return;

		const entry = audit.entries.find(
			(e) =>
				e.target.id === data.applicationId &&
				Date.now() - e.createdTimestamp < 5000,
		);
		const executor = entry ? entry.executor : null;

		const components = [
			new ContainerBuilder()
				.setAccentColor(
					convertColor('Blurple', { from: 'discord', to: 'decimal' }),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`🛡️ **Slash Command Permissions Updated**\n\n` +
							`**Application ID:** ${data.applicationId}\n` +
							`**Command ID:** ${data.id}\n` +
							(executor
								? `**Updated By:** ${executor.tag} (<@${executor.id}>)`
								: ''),
					),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`🔗 **Guild ID:** ${guild.id}\n` +
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
			label: 'applicationCommandPermissionsUpdate',
		});
		if (bot.config?.sentry?.dsn) {
			Sentry.captureException(err);
		}
	}
};
