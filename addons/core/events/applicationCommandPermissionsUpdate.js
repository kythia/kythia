/**
 * @namespace: addons/core/events/applicationCommandPermissionsUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags, AuditLogEvent } = require('discord.js');
const Sentry = require('@sentry/node');
const { BaseEvent } = require('kythia-core');
class ApplicationCommandPermissionsUpdateEvent extends BaseEvent {
	async execute(data) {
		const container = this.container;
		const _bot = {
			client: this.client,
			container: this.container,
		};
		const { kythiaConfig, helpers, models, logger, t } = container;
		const { convertColor } = helpers.color;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
		const guildId = data.guildId;
		if (!guildId) return;
		try {
			const guild = await helpers.discord.getGuildSafe(this.client, guildId);
			if (!guild) return;
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

			// Fetch audit log
			if (!guild.members.me?.permissions?.has('ViewAuditLog')) return;
			const audit = await guild
				.fetchAuditLogs({
					type: AuditLogEvent.ApplicationCommandPermissionUpdate,
					limit: 1,
				})
				.catch(() => null);
			if (!audit) return;
			const entry = audit.entries.find(
				(e) =>
					e.target.id === data.applicationId &&
					Date.now() - e.createdTimestamp < 5000,
			);
			const executor = entry ? entry.executor : null;
			const components = await simpleContainer(
				{
					client: this.client,
					guildId: guildId,
				},
				`**Slash Command Permissions Updated**\n\n` +
					`**Application ID:** ${data.applicationId}\n` +
					`**Command ID:** ${data.id}\n` +
					(executor
						? `**Updated By:** ${executor.tag} (<@${executor.id}>)`
						: '') +
					'\n\n' +
					(`**Guild ID:** ${guild.id}\n` +
						`**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>`),
				{
					color: convertColor('Blurple', {
						from: 'discord',
						to: 'decimal',
					}),
					withFooter: true,
				},
			);
			await logChannel.send({
				components,
				flags: MessageFlags.IsComponentsV2,
				allowedMentions: {
					parse: [],
				},
			});
		} catch (err) {
			logger.error(`Error: ${err.message || err}`, {
				label: 'applicationCommandPermissionsUpdate',
			});
			if (kythiaConfig?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = ApplicationCommandPermissionsUpdateEvent;
