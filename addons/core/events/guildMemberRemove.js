/**
 * @namespace: addons/core/events/guildMemberRemove.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { AuditLogEvent, MessageFlags } = require('discord.js');
const Sentry = require('@sentry/node');
const { BaseEvent } = require('kythia-core');
class GuildMemberRemoveEvent extends BaseEvent {
	async execute(member) {
		const container = this.container;
		const _bot = {
			client: this.client,
			container: this.container,
		};
		if (!member.guild) return;
		const { kythiaConfig, models, helpers, logger, t } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
		const { convertColor } = helpers.color;
		const guildId = member.guild.id;

		// ── Audit log ────────────────────────────────────────────────
		const setting = await ServerSetting.getCache({
			guildId: member.guild.id,
		});
		if (!setting?.auditLogChannelId) return;
		const logChannel = await helpers.discord.getChannelSafe(
			member.guild,
			setting.auditLogChannelId,
		);
		if (logChannel?.isTextBased()) {
			try {
				// Check if it was a kick
				if (!member.guild.members.me?.permissions?.has('ViewAuditLog')) return;
				const kickAudit = await member.guild
					.fetchAuditLogs({
						type: AuditLogEvent.MemberKick,
						limit: 1,
					})
					.catch(() => null);
				if (!kickAudit) return;
				const kickEntry = kickAudit.entries.find(
					(e) =>
						e.target?.id === member.id &&
						e.createdTimestamp > Date.now() - 5000,
				);
				if (kickEntry) {
					const executor = kickEntry.executor;
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
							'core.events.guildMemberRemove.log',
							{
								var0: executor?.id || 'Unknown',
								tag: member.user.tag,
								id: member.user.id,
								id_1: member.user.id,
								var4: Math.floor(member.user.createdTimestamp / 1000),
								var5: member.joinedAt
									? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:F>`
									: 'Unknown',
								conditional6: kickEntry.reason
									? await t(
											{
												client: this.client,
												guildId: guildId,
											},
											'core.events.common.reason',
											{
												reason: kickEntry.reason,
											},
										)
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
					return;
				}

				// Regular leave log
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
						'core.events.guildMemberRemove.log_1',
						{
							tag: member.user.tag,
							id: member.user.id,
							id_1: member.user.id,
							var3: Math.floor(member.user.createdTimestamp / 1000),
							var4: member.joinedAt
								? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:F>`
								: 'Unknown',
							memberCount: member.guild.memberCount,
							tag_1: member.user.tag,
							var7: Math.floor(Date.now() / 1000),
						},
					),
					{
						color: convertColor('Orange', {
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
				if (err.code === 50001 || err.code === 50013) return;
				logger.error(`Error: ${err.message || err}`, {
					label: 'guildMemberRemove',
				});
				if (kythiaConfig?.sentry?.dsn) {
					Sentry.captureException(err);
				}
			}
		}
	}
}
module.exports = GuildMemberRemoveEvent;
