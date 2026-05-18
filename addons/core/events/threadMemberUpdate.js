/**
 * @namespace: addons/core/events/threadMemberUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const {
	MessageFlags,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
const Sentry = require('@sentry/node');

module.exports = async (bot, oldMember, newMember) => {
	const container = bot.client.container;
	const { helpers, models, logger, t } = container;
	const { convertColor } = helpers.color;
	const { ServerSetting } = models;

	// This event fires when a thread member is updated (flags, etc).
	// Often fires when they join/leave too? No, usually threadMembersUpdate covers the list changing.
	// threadMemberUpdate is for specific member properties changing.
	// But sometimes it's used for tracking.

	// We need the guild. ThreadMember has .thread which has .guild
	const thread = newMember.thread || oldMember.thread;
	if (!thread?.guild) return;
	const guild = thread.guild;
	const guildId = guild.id;

	try {
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

		// We can check what changed. Flags?
		const changes = [];
		if (oldMember.flags.bitfield !== newMember.flags.bitfield) {
			changes.push(
				`**Flags:** ${oldMember.flags.bitfield} ➔ ${newMember.flags.bitfield}`,
			);
		}

		if (changes.length === 0) return; // Ignore if no visible changes

		const components = [
			new ContainerBuilder()
				.setAccentColor(
					convertColor('Blurple', { from: 'discord', to: 'decimal' }),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`🧵 **Thread Member Updated**\n\n` +
							`**Member:** <@${newMember.id}>\n` +
							`**Thread:** <#${thread.id}>\n` +
							`**Changes:**\n${changes.join('\n')}`,
					),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`👤 **User:** ${newMember.id}\n` +
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
			label: 'threadMemberUpdate',
		});
		if (bot.config?.sentry?.dsn) {
			Sentry.captureException(err);
		}
	}
};
