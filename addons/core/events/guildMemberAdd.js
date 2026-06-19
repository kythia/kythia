/**
 * @namespace: addons/core/events/guildMemberAdd.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags } = require('discord.js');
const Sentry = require('@sentry/node');
const { BaseEvent } = require('kythia-core');
class GuildMemberAddEvent extends BaseEvent {
	async execute(member) {
		const container = this.container;
		const _bot = {
			client: this.client,
			container: this.container,
		};
		const { kythiaConfig, models, helpers, logger, t } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
		const { convertColor } = helpers.color;
		const guildId = member.guild.id;

		// const [user] = await User.getOrCreateCache(
		// 	{ userId: member.user.id, guildId },
		// 	{ userId: member.user.id, guildId },
		// );

		// ── Audit log ────────────────────────────────────────────────
		const setting = await ServerSetting.getCache({
			guildId,
		});
		if (!setting?.auditLogChannelId) return;
		const logChannel = await helpers.discord.getChannelSafe(
			member.guild,
			setting.auditLogChannelId,
		);
		if (logChannel?.isTextBased()) {
			try {
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
						'core.events.guildMemberAdd.log',
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
					label: 'guildMemberAdd',
				});
				if (kythiaConfig?.sentry?.dsn) {
					Sentry.captureException(err);
				}
			}
		}
	}
}
module.exports = GuildMemberAddEvent;
