/**
 * @namespace: addons/core/events/webhooksUpdate.js
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
class WebhooksUpdateEvent extends BaseEvent {
	async execute(channel) {
		const container = this.container;
		const bot = {
			client: this.client,
			container: this.container,
		};
		if (!channel.guild) return;
		const { models, helpers, logger, t } = container;
		const { ServerSetting } = models;
		const { convertColor } = helpers.color;
		const guildId = channel.guild.id;
		try {
			const settings = await ServerSetting.getCache({
				guildId: channel.guild.id,
			});
			if (!settings?.auditLogChannelId) return;
			const logChannel = await helpers.discord.getChannelSafe(
				channel.guild,
				settings.auditLogChannelId,
			);
			if (!logChannel?.isTextBased()) return;
			if (
				!logChannel
					.permissionsFor(this.client.user)
					?.has(['ViewChannel', 'SendMessages'])
			)
				return;

			// Check for webhook creation, update, or deletion
			if (!channel.guild.members.me?.permissions?.has('ViewAuditLog')) return;
			const createAudit = await channel.guild
				.fetchAuditLogs({
					type: AuditLogEvent.WebhookCreate,
					limit: 1,
				})
				.catch(() => null);
			if (!createAudit) return;
			if (!channel.guild.members.me?.permissions?.has('ViewAuditLog')) return;
			const updateAudit = await channel.guild
				.fetchAuditLogs({
					type: AuditLogEvent.WebhookUpdate,
					limit: 1,
				})
				.catch(() => null);
			if (!updateAudit) return;
			if (!channel.guild.members.me?.permissions?.has('ViewAuditLog')) return;
			const deleteAudit = await channel.guild
				.fetchAuditLogs({
					type: AuditLogEvent.WebhookDelete,
					limit: 1,
				})
				.catch(() => null);
			if (!deleteAudit) return;
			const createEntry = createAudit.entries.find(
				(e) =>
					e.extra?.channel?.id === channel.id &&
					e.createdTimestamp > Date.now() - 5000,
			);
			const updateEntry = updateAudit.entries.find(
				(e) =>
					e.extra?.channel?.id === channel.id &&
					e.createdTimestamp > Date.now() - 5000,
			);
			const deleteEntry = deleteAudit.entries.find(
				(e) =>
					e.extra?.channel?.id === channel.id &&
					e.createdTimestamp > Date.now() - 5000,
			);
			const entry = createEntry || updateEntry || deleteEntry;
			if (!entry) return;
			const action = createEntry
				? 'Created'
				: updateEntry
					? 'Updated'
					: 'Deleted';
			const color = createEntry ? 'Green' : updateEntry ? 'Blurple' : 'Red';
			const executor = entry.executor;
			const components = [
				new ContainerBuilder()
					.setAccentColor(
						convertColor(color, {
							from: 'discord',
							to: 'decimal',
						}),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`🪝 **Webhook ${action}** by <@${executor?.id || 'Unknown'}>\n\n` +
								`**Channel:** <#${channel.id}>\n` +
								`**Webhook Name:** ${entry.target?.name || 'Unknown'}` +
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
				label: 'webhooksUpdate',
			});
			if (bot.config?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = WebhooksUpdateEvent;
