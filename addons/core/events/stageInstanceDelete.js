/**
 * @namespace: addons/core/events/stageInstanceDelete.js
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

const { BaseEvent } = require('kythia-core');

class StageInstanceDeleteEvent extends BaseEvent {
	async execute(stageInstance) {
		const container = this.container;
		const bot = { client: this.client, container: this.container };

		if (!stageInstance.guild) return;
		const { models, helpers, logger, t } = container;
		const { ServerSetting } = models;
		const { convertColor } = helpers.color;
		const guildId = stageInstance.guild.id;

		try {
			const settings = await ServerSetting.getCache({
				guildId: stageInstance.guild.id,
			});
			if (!settings?.auditLogChannelId) return;

			const logChannel = await stageInstance.guild.channels
				.fetch(settings.auditLogChannelId)
				.catch(() => null);
			if (!logChannel?.isTextBased()) return;
			if (
				!logChannel
					.permissionsFor(this.client.user)
					?.has(['ViewChannel', 'SendMessages'])
			)
				return;

			if (!stageInstance.guild.members.me?.permissions?.has('ViewAuditLog'))
				return;
			const audit = await stageInstance.guild
				.fetchAuditLogs({
					type: AuditLogEvent.StageInstanceDelete,
					limit: 1,
				})
				.catch(() => null);
			if (!audit) return;

			const entry = audit.entries.find(
				(e) =>
					e.target?.id === stageInstance.id &&
					e.createdTimestamp > Date.now() - 5000,
			);

			if (!entry) return;

			const executor = entry.executor;
			const components = [
				new ContainerBuilder()
					.setAccentColor(
						convertColor('Red', { from: 'discord', to: 'decimal' }),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`🎤 **Stage Ended** by <@${executor?.id || 'Unknown'}>\n\n` +
								`**Topic:** ${stageInstance.topic}\n` +
								`**Channel:** <#${stageInstance.channelId}>` +
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
								username: this.client.user.username,
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
				label: 'stageInstanceDelete',
			});
			if (bot.config?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}

module.exports = StageInstanceDeleteEvent;
