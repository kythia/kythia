/**
 * @namespace: addons/automod/events/autoModerationRuleCreate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { Sentry } = require('@sentry/node');
const {
	AuditLogEvent,
	MessageFlags,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
const { BaseEvent } = require('kythia-core');
class AutoModerationRuleCreateEvent extends BaseEvent {
	async execute(autoModerationRule) {
		const container = this.container;
		const bot = {
			client: this.client,
			container: this.container,
		};
		if (!autoModerationRule.guild) return;
		const { models, helpers, logger, t } = container;
		const { ServerSetting } = models;
		const { convertColor } = helpers.color;
		const guildId = autoModerationRule.guild.id;
		try {
			const settings = await ServerSetting.getCache({
				guildId,
			});
			if (!settings?.auditLogChannelId) return;
			const logChannel = await helpers.discord.getChannelSafe(
				autoModerationRule.guild,
				settings.auditLogChannelId,
			);
			if (!logChannel?.isTextBased()) return;
			if (
				!logChannel
					.permissionsFor(this.client.user)
					?.has(['ViewChannel', 'SendMessages'])
			)
				return;
			if (
				!autoModerationRule.guild.members.me?.permissions?.has('ViewAuditLog')
			)
				return;
			const audit = await autoModerationRule.guild
				.fetchAuditLogs({
					type: AuditLogEvent.AutoModerationRuleCreate,
					limit: 1,
				})
				.catch(() => null);
			if (!audit) return;
			const entry = audit.entries.find(
				(e) =>
					e.target?.id === autoModerationRule.id &&
					e.createdTimestamp > Date.now() - 5000,
			);
			if (!entry) return;
			const executor = entry.executor;
			const components = [
				new ContainerBuilder()
					.setAccentColor(
						convertColor('Green', {
							from: 'discord',
							to: 'decimal',
						}),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`🛡️ **AutoMod Rule Created** by <@${executor?.id || 'Unknown'}>\n\n` +
								`**Rule Name:** ${autoModerationRule.name}\n` +
								`**Trigger Type:** ${autoModerationRule.triggerType}\n` +
								`**Enabled:** ${autoModerationRule.enabled ? 'Yes' : 'No'}\n` +
								`**Exempt Roles:** ${autoModerationRule.exemptRoles.size || 'None'}\n` +
								`**Exempt Channels:** ${autoModerationRule.exemptChannels.size || 'None'}` +
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
							await t(
								{
									guildId,
								},
								'common.container.footer',
								{
									username: this.client.user.username,
								},
							),
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
				label: 'autoModerationRuleCreate',
			});
			if (bot.config?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = AutoModerationRuleCreateEvent;
