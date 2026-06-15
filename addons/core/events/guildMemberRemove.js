/**
 * @namespace: addons/core/events/guildMemberRemove.js
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
class GuildMemberRemoveEvent extends BaseEvent {
	async execute(member) {
		const container = this.container;
		const bot = {
			client: this.client,
			container: this.container,
		};
		if (!member.guild) return;
		const { models, helpers, logger, t } = container;
		const { ServerSetting } = models;
		const { convertColor } = helpers.color;

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
					const components = [
						new ContainerBuilder()
							.setAccentColor(
								convertColor('Red', {
									from: 'discord',
									to: 'decimal',
								}),
							)
							.addTextDisplayComponents(
								new TextDisplayBuilder().setContent(
									`👢 **Member Kicked** by <@${executor?.id || 'Unknown'}>\n\n` +
										`**User:** ${member.user.tag} (<@${member.user.id}>)\n` +
										`**User ID:** ${member.user.id}\n` +
										`**Account Created:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:F>\n` +
										`**Joined Server:** ${member.joinedAt ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:F>` : 'Unknown'}` +
										(kickEntry.reason
											? `\n\n**Reason:** ${kickEntry.reason}`
											: ''),
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
											guildId: member.guild.id,
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
					return;
				}

				// Regular leave log
				const components = [
					new ContainerBuilder()
						.setAccentColor(
							convertColor('Orange', {
								from: 'discord',
								to: 'decimal',
							}),
						)
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(
								`## 👋 Member Left\n\n` +
									`**User:** ${member.user.tag} (<@${member.user.id}>)\n` +
									`**User ID:** ${member.user.id}\n` +
									`**Account Created:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:F>\n` +
									`**Joined Server:** ${member.joinedAt ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:F>` : 'Unknown'}\n` +
									`**Member Count:** ${member.guild.memberCount}`,
							),
						)
						.addSeparatorComponents(
							new SeparatorBuilder()
								.setSpacing(SeparatorSpacingSize.Small)
								.setDivider(true),
						)
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(
								`👤 **User:** ${member.user.tag}\n` +
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
										guildId: member.guild.id,
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
				if (err.code === 50001 || err.code === 50013) return;
				logger.error(`Error: ${err.message || err}`, {
					label: 'guildMemberRemove',
				});
				if (bot.config?.sentry?.dsn) {
					Sentry.captureException(err);
				}
			}
		}
	}
}
module.exports = GuildMemberRemoveEvent;
