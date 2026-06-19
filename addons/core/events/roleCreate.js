/**
 * @namespace: addons/core/events/roleCreate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { AuditLogEvent, MessageFlags } = require('discord.js');
const Sentry = require('@sentry/node');
const { BaseEvent } = require('kythia-core');
class RoleCreateEvent extends BaseEvent {
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
					type: AuditLogEvent.RoleCreate,
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
					'core.events.roleCreate.log',
					{
						var0: executor?.id || 'Unknown',
						id: role.id,
						hexColor: role.hexColor || 'Default',
						position: role.position,
						var4: role.mentionable ? 'Yes' : 'No',
						var5: role.hoist ? 'Yes' : 'No',
						var6: role.managed ? 'Yes' : 'No',
						conditional7: entry.reason
							? await t(
									{
										client: this.client,
										guildId: guildId,
									},
									'core.events.common.reason',
									{
										reason: entry.reason,
									},
								)
							: '',
						var8: executor?.tag || 'Unknown',
						var9: executor?.id || 'Unknown',
						var10: Math.floor(Date.now() / 1000),
					},
				),
				{
					color: convertColor('Green', {
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
				label: 'roleCreate',
			});
			if (kythiaConfig?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = RoleCreateEvent;
