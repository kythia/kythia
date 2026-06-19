/**
 * @namespace: addons/core/events/guildIntegrationsUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags, AuditLogEvent } = require('discord.js');
const Sentry = require('@sentry/node');
const { BaseEvent } = require('kythia-core');
class GuildIntegrationsUpdateEvent extends BaseEvent {
	async execute(guild) {
		const container = this.container;
		const _bot = {
			client: this.client,
			container: this.container,
		};
		const { kythiaConfig, helpers, models, logger, t } = container;
		const { convertColor } = helpers.color;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
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
			const components = await simpleContainer(
				{
					client: this.client,
					guildId: guildId,
				},
				await t(
					{
						client: this.client,
						guildId: guildId,
					},
					'core.events.guildIntegrationsUpdate.log',
					{
						name: guild.name,
						conditional1: executor
							? `\n\n**Potential Executor:** ${executor.tag} (<@${executor.id}>)`
							: '',
						var2: Math.floor(Date.now() / 1000),
					},
				),
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
				label: 'guildIntegrationsUpdate',
			});
			if (kythiaConfig?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = GuildIntegrationsUpdateEvent;
