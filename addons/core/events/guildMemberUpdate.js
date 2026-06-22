/**
 * @namespace: addons/core/events/guildMemberUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { AuditLogEvent, MessageFlags } = require('discord.js');
const Sentry = require('@sentry/node');
const { BaseEvent } = require('kythia-core');
class GuildMemberUpdateEvent extends BaseEvent {
	async execute(oldMember, newMember) {
		const container = this.container;
		if (!newMember.guild) return;
		const { kythiaConfig, models, helpers, logger, t } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
		const { convertColor } = helpers.color;
		const guildId = newMember.guild.id;
		try {
			const settings = await ServerSetting.getCache({
				guildId: newMember.guild.id,
			});
			if (!settings?.auditLogChannelId) return;
			const logChannel = await helpers.discord.getChannelSafe(
				newMember.guild,
				settings.auditLogChannelId,
			);
			if (!logChannel?.isTextBased()) return;
			if (
				!logChannel
					.permissionsFor(this.client.user)
					?.has(['ViewChannel', 'SendMessages'])
			)
				return;
			if (!newMember.guild.members.me?.permissions?.has('ViewAuditLog')) return;
			const addedRoles = newMember.roles.cache.filter(
				(role) => !oldMember.roles.cache.has(role.id),
			);
			const removedRoles = oldMember.roles.cache.filter(
				(role) => !newMember.roles.cache.has(role.id),
			);
			const nicknameChanged = oldMember.nickname !== newMember.nickname;
			if (!nicknameChanged && addedRoles.size === 0 && removedRoles.size === 0)
				return;
			let auditType = AuditLogEvent.MemberUpdate;
			if (addedRoles.size > 0 || removedRoles.size > 0) {
				auditType = AuditLogEvent.MemberRoleUpdate;
			}
			const audit = await newMember.guild
				.fetchAuditLogs({
					type: auditType,
					limit: 1,
				})
				.catch(() => null);
			let executor = null;
			let reason = null;
			if (audit) {
				const entry = audit.entries.find(
					(e) =>
						e.target?.id === newMember.id &&
						e.createdTimestamp > Date.now() - 5000,
				);
				if (entry) {
					executor = entry.executor;
					reason = entry.reason;
				}
			}
			const changes = [];
			if (nicknameChanged) {
				changes.push(
					`**Nickname**: \`${oldMember.nickname || 'None'}\` \`${newMember.nickname || 'None'}\``,
				);
			}
			if (addedRoles.size > 0) {
				changes.push(
					`**Roles Added**: ${addedRoles.map((r) => `<@&${r.id}>`).join(', ')}`,
				);
			}
			if (removedRoles.size > 0) {
				changes.push(
					`**Roles Removed**: ${removedRoles.map((r) => `<@&${r.id}>`).join(', ')}`,
				);
			}
			if (changes.length === 0) return;
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
					'core.events.guildMemberUpdate.log',
					{
						tag: newMember.user.tag,
						id: newMember.id,
						changes: changes.join('\n'),
						reason: reason
							? await t(
									{
										client: this.client,
										guildId: guildId,
									},
									'core.helpers.index.events.common.reason',
									{
										reason: reason,
									},
								)
							: '',
						executorTag: executor?.tag || 'Unknown',
						executorId: executor?.id || 'Unknown',
						timestamp: Math.floor(Date.now() / 1000),
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
				label: 'guildMemberUpdate',
			});
			if (kythiaConfig.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = GuildMemberUpdateEvent;
