/**
 * @namespace: addons/core/events/inviteDelete.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { AuditLogEvent, MessageFlags } = require('discord.js');
const Sentry = require('@sentry/node');
const { BaseEvent } = require('kythia-core');
class InviteDeleteEvent extends BaseEvent {
	async execute(invite) {
		const container = this.container;
		const _bot = {
			client: this.client,
			container: this.container,
		};
		if (!invite.guild) return;
		const { kythiaConfig, models, helpers, logger, t } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
		const { convertColor } = helpers.color;
		const guildId = invite.guild.id;
		try {
			const settings = await ServerSetting.getCache({
				guildId: invite.guild.id,
			});
			if (!settings?.auditLogChannelId) return;
			const logChannel = await helpers.discord.getChannelSafe(
				invite.guild,
				settings.auditLogChannelId,
			);
			if (!logChannel?.isTextBased()) return;
			if (
				!logChannel
					.permissionsFor(this.client.user)
					?.has(['ViewChannel', 'SendMessages'])
			)
				return;
			if (!invite.guild.members.me?.permissions?.has('ViewAuditLog')) return;
			const audit = await invite.guild
				.fetchAuditLogs({
					type: AuditLogEvent.InviteDelete,
					limit: 1,
				})
				.catch(() => null);
			if (!audit) return;
			const entry = audit.entries.find(
				(e) =>
					e.target?.code === invite.code &&
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
					'core.events.inviteDelete.log',
					{
						var0: executor?.id || 'Unknown',
						code: invite.code,
						var2: invite.channel ? `<#${invite.channel.id}>` : 'Unknown',
						uses: invite.uses || 0,
						var4: invite.maxUses ? invite.maxUses.toString() : 'Unlimited',
						var5: invite.maxAge ? `${invite.maxAge} seconds` : 'Never expires',
						var6: invite.temporary ? 'Yes' : 'No',
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
				label: 'inviteDelete',
			});
			if (kythiaConfig?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = InviteDeleteEvent;
