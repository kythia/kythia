/**
 * @namespace: addons/core/events/roleDelete.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { AuditLogEvent, MessageFlags } = require('discord.js');
const Sentry = require('@sentry/node');
const { BaseEvent } = require('kythia-core');
class RoleDeleteEvent extends BaseEvent {
	async execute(role) {
		const container = this.container;
		const _bot = {
			client: this.client,
			container: this.container,
		};
		if (!role.guild) return;
		const { kythiaConfig, models, helpers, logger, t } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
		const { convertColor } = helpers.color;
		const guildId = role.guild.id;
		try {
			const settings = await ServerSetting.getCache({
				guildId: role.guild.id,
			});
			if (!settings?.auditLogChannelId) return;
			const logChannel = await helpers.discord.getChannelSafe(
				role.guild,
				settings.auditLogChannelId,
			);
			if (!logChannel?.isTextBased()) return;
			if (
				!logChannel
					.permissionsFor(this.client.user)
					?.has(['ViewChannel', 'SendMessages'])
			)
				return;
			if (!role.guild.members.me?.permissions?.has('ViewAuditLog')) return;
			const audit = await role.guild
				.fetchAuditLogs({
					type: AuditLogEvent.RoleDelete,
					limit: 1,
				})
				.catch(() => null);
			if (!audit) return;
			const entry = audit.entries.find(
				(e) =>
					e.target?.id === role.id && e.createdTimestamp > Date.now() - 5000,
			);
			if (!entry) return;
			const executor = entry.executor;
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
					'core.events.roleDelete.log',
					{
						name: role.name,
						hexColor: role.hexColor || 'Default',
						position: role.position,
						mentionable: role.mentionable ? 'Yes' : 'No',
						hoisted: role.hoist ? 'Yes' : 'No',
						managed: role.managed ? 'Yes' : 'No',
						reason: entry.reason
							? await t(
									{
										client: this.client,
										guildId: guildId,
									},
									'core.helpers.index.events.common.reason',
									{
										reason: entry.reason,
									},
								)
							: '',
						executorTag: executor?.tag || 'Unknown',
						executorId: executor?.id || 'Unknown',
						timestamp: Math.floor(Date.now() / 1000),
					},
				),
				{
					color: convertColor('Red', {
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
				label: 'roleDelete',
			});
			if (kythiaConfig?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = RoleDeleteEvent;
