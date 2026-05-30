/**
 * @namespace: addons/core/events/threadMembersUpdate.js
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
} = require('discord.js');
const Sentry = require('@sentry/node');

module.exports = async (bot, oldMembers, newMembers, thread) => {
	const container = bot.client.container;
	const { helpers, models, logger, t } = container;
	const { convertColor } = helpers.color;
	const { ServerSetting } = models;

	if (!thread.guild) return;
	const guildId = thread.guild.id;

	try {
		// This event works with collections of members added/removed.
		const addedMembers = newMembers.filter((m) => !oldMembers.has(m.id));
		const removedMembers = oldMembers.filter((m) => !newMembers.has(m.id));

		if (addedMembers.size === 0 && removedMembers.size === 0) return;

		const settings = await ServerSetting.getCache({
			guildId: thread.guild.id,
		});
		if (!settings?.auditLogChannelId) return;

		const logChannel = await thread.guild.channels
			.fetch(settings.auditLogChannelId)
			.catch(() => null);
		if (!logChannel?.isTextBased()) return;
		if (
			!logChannel
				.permissionsFor(bot.client.user)
				?.has(['ViewChannel', 'SendMessages'])
		)
			return;

		let description = `🧵 **Thread Members Updated** in <#${thread.id}>\n\n`;

		if (addedMembers.size > 0) {
			const addedList = addedMembers.map((m) => `<@${m.id}>`).join(', ');
			description += `**Added (${addedMembers.size}):** ${addedList.length > 500 ? `${addedList.substring(0, 500)}...` : addedList}\n`;
		}

		if (removedMembers.size > 0) {
			const removedList = removedMembers.map((m) => `<@${m.id}>`).join(', ');
			description += `**Removed (${removedMembers.size}):** ${removedList.length > 500 ? `${removedList.substring(0, 500)}...` : removedList}\n`;
		}

		const components = [
			new ContainerBuilder()
				.setAccentColor(
					convertColor('Blurple', { from: 'discord', to: 'decimal' }),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(description),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`📝 **Thread ID:** ${thread.id}\n` +
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
			label: 'threadMembersUpdate',
		});
		if (bot.config?.sentry?.dsn) {
			Sentry.captureException(err);
		}
	}
};
