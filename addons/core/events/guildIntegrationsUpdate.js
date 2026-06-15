/**
 * @namespace: addons/core/events/guildIntegrationsUpdate.js
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
const { BaseEvent } = require('kythia-core');
class GuildIntegrationsUpdateEvent extends BaseEvent {
	async execute(guild) {
		const container = this.container;
		const bot = {
			client: this.client,
			container: this.container,
		};
		const { helpers, models, logger, t } = container;
		const { convertColor } = helpers.color;
		const { ServerSetting } = models;
		const guildId = guild.id;
		try {
			const settings = await ServerSetting.getCache({
				guildId: guild.id,
			});
			if (!settings?.auditLogChannelId) return;
			const logChannel = await helpers.discord.getChannelSafe(
				guild,
				settings.auditLogChannelId,
			);
			if (!logChannel?.isTextBased()) return;
			if (
				!logChannel
					.permissionsFor(this.client.user)
					?.has(['ViewChannel', 'SendMessages'])
			)
				return;

			// Fetch audit log to see who updated it
			if (!guild.members.me?.permissions?.has('ViewAuditLog')) return;
			const audit = await guild
				.fetchAuditLogs({
					type: AuditLogEvent.IntegrationCreate,
					// Or Delete/Update. It's hard to distinguish perfectly without checking multiple types or checking exact time.
					limit: 1,
				})
				.catch(() => null);
			if (!audit) return;

			// We check for IntegrationCreate, IntegrationDelete, IntegrationUpdate
			// Since this event just says "updated", we might not know exactly WHAT happened without looking deep at audit logs.
			// Detailed audit log checking takes more requests. For now, we'll try to get the latest relevant entry.

			const entry = audit.entries.first();
			// Ideally we'd filter by time, but this event fires right after.
			const isRecent = entry && Date.now() - entry.createdTimestamp < 5000;
			const executor = isRecent ? entry.executor : null;
			const components = [
				new ContainerBuilder()
					.setAccentColor(
						convertColor('Blurple', {
							from: 'discord',
							to: 'decimal',
						}),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`🧩 **Integrations Updated**\n\n` +
								`The integrations for **${guild.name}** were updated.` +
								(executor
									? `\n\n**Potential Executor:** ${executor.tag} (<@${executor.id}>)`
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
				label: 'guildIntegrationsUpdate',
			});
			if (bot.config?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = GuildIntegrationsUpdateEvent;
