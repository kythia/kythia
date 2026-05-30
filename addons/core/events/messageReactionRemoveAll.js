/**
 * @namespace: addons/core/events/messageReactionRemoveAll.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
	AuditLogEvent,
} = require('discord.js');
const Sentry = require('@sentry/node');

module.exports = async (bot, message, _reactions) => {
	const container = bot.client.container;
	const { helpers, models, logger, t } = container;
	const { convertColor } = helpers.color;
	const { ServerSetting } = models;
	const guildId = message.guild?.id;

	if (!message.guild) return;

	try {
		const settings = await ServerSetting.getCache({
			guildId: message.guild.id,
		});
		if (!settings?.auditLogChannelId) return;

		const logChannel = await message.guild.channels
			.fetch(settings.auditLogChannelId)
			.catch(() => null);
		if (!logChannel?.isTextBased()) return;
		if (
			!logChannel
				.permissionsFor(bot.client.user)
				?.has(['ViewChannel', 'SendMessages'])
		)
			return;

		// Try to fetch audit log to see who cleared them
		if (!message.guild.members.me?.permissions?.has('ViewAuditLog')) return;
		const audit = await message.guild
			.fetchAuditLogs({
				type: AuditLogEvent.MessageReactionRemoveAll,
				limit: 1,
			})
			.catch(() => null);
		if (!audit) return;

		const entry = audit.entries.find(
			(e) =>
				e.target.id === message.id && Date.now() - e.createdTimestamp < 5000,
		);
		const executor = entry ? entry.executor : null;

		const components = [
			new ContainerBuilder()
				.setAccentColor(convertColor('Red', { from: 'discord', to: 'decimal' }))
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`🗑️ **All Reactions Removed** in <#${message.channelId}>\n\n` +
							`**Message:** [Jump to Message](${message.url})` +
							(executor
								? `\n**Executor:** ${executor.tag} (<@${executor.id}>)`
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
						`📝 **Message ID:** ${message.id}\n` +
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
			label: 'messageReactionRemoveAll',
		});
		if (bot.config?.sentry?.dsn) {
			Sentry.captureException(err);
		}
	}
};
