/**
 * @namespace: addons/core/events/guildBanRemove.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { AuditLogEvent, MessageFlags } = require('discord.js');
const Sentry = require('@sentry/node');
const { BaseEvent } = require('kythia-core');
class GuildBanRemoveEvent extends BaseEvent {
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
					type: AuditLogEvent.MemberBanRemove,
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
				`**Member Unbanned** by <@${executor?.id || 'Unknown'}>\n\n` +
					`**User:** ${ban.user.tag} (<@${ban.user.id}>)\n` +
					`**User ID:** ${ban.user.id}\n` +
					`**Account Created:** <t:${Math.floor(ban.user.createdTimestamp / 1000)}:F>` +
					(entry.reason ? `\n\n**Reason:** ${entry.reason}` : '') +
					'\n\n' +
					(`**Executor:** ${executor?.tag || 'Unknown'} (${executor?.id || 'Unknown'})\n` +
						`**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>`),
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
				label: 'guildBanRemove',
			});
			if (kythiaConfig?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = GuildBanRemoveEvent;
