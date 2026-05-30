/**
 * @namespace: addons/core/events/guildMemberAdd.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	MessageFlags,
} = require('discord.js');
const Sentry = require('@sentry/node');

module.exports = async (bot, member) => {
	const container = bot.client.container;
	const { models, helpers, logger, t } = container;
	const { ServerSetting, User } = models;
	const { convertColor } = helpers.color;

	const guildId = member.guild.id;

	// ── Ensure user record exists ─────────────────────────────────
	let user = await User.getCache({ userId: member.user.id, guildId });
	if (!user) {
		user = await User.create({ userId: member.user.id, guildId });
	}

	// ── Audit log ────────────────────────────────────────────────
	const setting = await ServerSetting.getCache({ guildId });
	if (!setting?.auditLogChannelId) return;

	const logChannel = await member.guild.channels
		.fetch(setting.auditLogChannelId)
		.catch(() => null);

	if (logChannel?.isTextBased()) {
		try {
			const components = [
				new ContainerBuilder()
					.setAccentColor(
						convertColor('Green', { from: 'discord', to: 'decimal' }),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`## Member Join\n\n` +
								`**User:** ${member.user.tag} (<@${member.user.id}>)\n` +
								`**User ID:** ${member.user.id}\n` +
								`**Account Created:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:F>\n` +
								`**Joined Server:** ${member.joinedAt ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:F>` : 'Unknown'}\n` +
								`**Member Count:** ${member.guild.memberCount}`,
						),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`👤 **User:** ${member.user.tag}\n` +
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
				allowedMentions: { parse: [] },
			});
		} catch (err) {
			logger.error(`Error: ${err.message || err}`, {
				label: 'guildMemberAdd',
			});
			if (bot.config?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
};
