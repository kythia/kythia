/**
 * @namespace: addons/core/events/emojiCreate.js
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

module.exports = async (bot, emoji) => {
	if (!emoji.guild) return;
	const container = bot.client.container;
	const { models, helpers, t, logger } = container;
	const { ServerSetting } = models;
	const { convertColor } = helpers.color;

	const guildId = emoji.guild.id;

	try {
		const settings = await ServerSetting.getCache({ guildId });
		if (!settings?.auditLogChannelId) return;

		const logChannel = await emoji.guild.channels
			.fetch(settings.auditLogChannelId)
			.catch(() => null);
		if (!logChannel?.isTextBased()) return;
		if (
			!logChannel
				.permissionsFor(bot.client.user)
				?.has(['ViewChannel', 'SendMessages'])
		)
			return;

		if (!emoji.guild.members.me?.permissions?.has('ViewAuditLog')) return;
		const audit = await emoji.guild
			.fetchAuditLogs({
				type: AuditLogEvent.EmojiCreate,
				limit: 1,
			})
			.catch(() => null);
		if (!audit) return;

		const entry = audit.entries.find(
			(e) =>
				e.target?.id === emoji.id && e.createdTimestamp > Date.now() - 10000,
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
						`😃 **Emoji Created** by <@${executor?.id || 'Unknown'}>\n\n` +
							`**Emoji:** <:${emoji.name}:${emoji.id}>\n` +
							`**Name:** ${emoji.name}\n` +
							`**Animated:** ${emoji.animated ? 'Yes' : 'No'}\n` +
							`**Available:** ${emoji.available ? 'Yes' : 'No'}\n` +
							`**Managed:** ${emoji.managed ? 'Yes' : 'No'}` +
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
			label: 'emojiCreate',
		});
	}
};
