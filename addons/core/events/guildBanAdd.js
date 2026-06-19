/**
 * @namespace: addons/core/events/guildBanAdd.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { AuditLogEvent, MessageFlags } = require('discord.js');
const Sentry = require('@sentry/node');
const { BaseEvent } = require('kythia-core');
class GuildBanAddEvent extends BaseEvent {
	async execute(ban) {
		const container = this.container;
		const _bot = {
			client: this.client,
			container: this.container,
		};
		if (!ban.guild) return;
		const { kythiaConfig, models, helpers, logger, t } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
		const { convertColor } = helpers.color;
		const guildId = ban.guild.id;
		try {
			const settings = await ServerSetting.getCache({
				guildId,
			});
			if (!settings?.auditLogChannelId) return;
			const logChannel = await helpers.discord.getChannelSafe(
				ban.guild,
				settings.auditLogChannelId,
			);
			if (!logChannel?.isTextBased()) return;
			if (
				!logChannel
					.permissionsFor(this.client.user)
					?.has(['ViewChannel', 'SendMessages'])
			)
				return;
			if (!ban.guild.members.me?.permissions?.has('ViewAuditLog')) return;
			const audit = await ban.guild
				.fetchAuditLogs({
					type: AuditLogEvent.MemberBanAdd,
					limit: 1,
				})
				.catch(() => null);
			if (!audit) return;
			const entry = audit.entries.find(
				(e) =>
					e.target?.id === ban.user.id &&
					e.createdTimestamp > Date.now() - 5000,
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
					'core.events.guildBanAdd.log',
					{
						var0: executor?.id || 'Unknown',
						tag: ban.user.tag,
						id: ban.user.id,
						id_1: ban.user.id,
						var4: Math.floor(ban.user.createdTimestamp / 1000),
						reason: ban.reason || 'No reason provided',
						conditional6: entry.reason
							? `\n**Audit Reason:** ${entry.reason}`
							: '',
						var7: executor?.tag || 'Unknown',
						var8: executor?.id || 'Unknown',
						var9: Math.floor(Date.now() / 1000),
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
				label: 'guildBanAdd',
			});
			if (kythiaConfig?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = GuildBanAddEvent;
