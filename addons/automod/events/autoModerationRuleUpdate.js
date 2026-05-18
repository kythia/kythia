/**
 * @namespace: addons/automod/events/autoModerationRuleUpdate.js
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
const { Sentry } = require('@sentry/node');

module.exports = async (bot, oldRule, newRule) => {
	if (!newRule.guild) return;
	const container = bot.client.container;
	const { models, helpers, logger, t } = container;
	const { ServerSetting } = models;
	const { convertColor } = helpers.color;

	const guildId = newRule.guild.id;

	try {
		const settings = await ServerSetting.getCache({
			guildId,
		});
		if (!settings?.auditLogChannelId) return;

		const logChannel = await newRule.guild.channels
			.fetch(settings.auditLogChannelId)
			.catch(() => null);
		if (!logChannel?.isTextBased()) return;
		if (
			!logChannel
				.permissionsFor(bot.client.user)
				?.has(['ViewChannel', 'SendMessages'])
		)
			return;

		if (!newRule.guild.members.me?.permissions?.has('ViewAuditLog')) return;
		const audit = await newRule.guild
			.fetchAuditLogs({
				type: AuditLogEvent.AutoModerationRuleUpdate,
				limit: 1,
			})
			.catch(() => null);
		if (!audit) return;

		const entry = audit.entries.find(
			(e) =>
				e.target?.id === newRule.id && e.createdTimestamp > Date.now() - 5000,
		);

		if (!entry) return;

		const changes = [];
		if (oldRule.name !== newRule.name) {
			changes.push(`**Name**: \`${oldRule.name}\` ➔ \`${newRule.name}\``);
		}
		if (oldRule.enabled !== newRule.enabled) {
			changes.push(
				`**Enabled**: \`${oldRule.enabled ? 'Yes' : 'No'}\` ➔ \`${newRule.enabled ? 'Yes' : 'No'}\``,
			);
		}

		if (changes.length === 0) return;

		const executor = entry.executor;
		const components = [
			new ContainerBuilder()
				.setAccentColor(
					convertColor('Blurple', { from: 'discord', to: 'decimal' }),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`🛡️ **AutoMod Rule Updated** by <@${executor?.id || 'Unknown'}>\n\n` +
							`**Rule:** ${newRule.name}\n\n` +
							`**Changes:**\n${changes.join('\n')}` +
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
			label: 'autoModerationRuleUpdate',
		});
		if (bot.config?.sentry?.dsn) {
			Sentry.captureException(err);
		}
	}
};
