/**
 * @namespace: addons/core/events/stickerUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
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

function formatChanges(changes) {
	if (!changes || changes.length === 0) return 'No changes detected.';
	return changes
		.map((change) => {
			const key = change.key
				.replace(/_/g, ' ')
				.replace(/\b\w/g, (l) => l.toUpperCase());
			const oldValue = change.old ?? 'Nothing';
			const newValue = change.new ?? 'Nothing';

			return `**${key}**: \`${oldValue}\` ➔ \`${newValue}\``;
		})
		.join('\n');
}

module.exports = async (bot, _oldSticker, newSticker) => {
	if (!newSticker.guild) return;
	const container = bot.client.container;
	const { models, helpers, logger, t } = container;
	const { ServerSetting } = models;
	const { convertColor } = helpers.color;
	const guildId = newSticker.guild.id;

	try {
		const settings = await ServerSetting.getCache({
			guildId: newSticker.guild.id,
		});
		if (!settings?.auditLogChannelId) return;

		const logChannel = await newSticker.guild.channels
			.fetch(settings.auditLogChannelId)
			.catch(() => null);
		if (!logChannel?.isTextBased()) return;
		if (
			!logChannel
				.permissionsFor(bot.client.user)
				?.has(['ViewChannel', 'SendMessages'])
		)
			return;

		if (!newSticker.guild.members.me?.permissions?.has('ViewAuditLog')) return;
		const audit = await newSticker.guild
			.fetchAuditLogs({
				type: AuditLogEvent.StickerUpdate,
				limit: 1,
			})
			.catch(() => null);
		if (!audit) return;

		const entry = audit.entries.find(
			(e) =>
				e.target?.id === newSticker.id &&
				e.createdTimestamp > Date.now() - 5000,
		);

		if (!entry) return;

		const executor = entry.executor;
		const components = [
			new ContainerBuilder()
				.setAccentColor(
					convertColor('Blurple', { from: 'discord', to: 'decimal' }),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`🏷️ **Sticker Updated** by <@${executor?.id || 'Unknown'}>\n\n` +
							`**Sticker:** <:${newSticker.name}:${newSticker.id}>\n\n` +
							`**Changes:**\n${formatChanges(entry.changes)}` +
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
			label: 'stickerUpdate',
		});
		if (bot.config?.sentry?.dsn) {
			Sentry.captureException(err);
		}
	}
};
