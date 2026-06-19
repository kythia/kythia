/**
 * @namespace: addons/core/events/emojiCreate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { AuditLogEvent, MessageFlags } = require('discord.js');
const { BaseEvent } = require('kythia-core');
class EmojiCreateEvent extends BaseEvent {
	async execute(emoji) {
		const container = this.container;
		if (!emoji.guild) return;
		const { models, helpers, t, logger } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
		const { convertColor } = helpers.color;
		const guildId = emoji.guild.id;
		try {
			const settings = await ServerSetting.getCache({
				guildId,
			});
			if (!settings?.auditLogChannelId) return;
			const logChannel = await helpers.discord.getChannelSafe(
				emoji.guild,
				settings.auditLogChannelId,
			);
			if (!logChannel?.isTextBased()) return;
			if (
				!logChannel
					.permissionsFor(this.client.user)
					?.has(['ViewChannel', 'SendMessages'])
			)
				return;
			if (!emoji.guild.members.me?.permissions?.has('ViewAuditLog')) return;
			const audit = await emoji.guild
				.fetchAuditLogs({
					type: AuditLogEvent.EmojiCreate,
					limit: 1,
				})
				.catch(() => null);
			if (!audit) return;
			const entry = audit.entries.find(
				(e) =>
					e.target?.id === emoji.id && e.createdTimestamp > Date.now() - 10000,
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
					'core.events.emojiCreate.log',
					{
						var0: executor?.id || 'Unknown',
						name: emoji.name,
						id: emoji.id,
						name_1: emoji.name,
						var4: emoji.animated ? 'Yes' : 'No',
						var5: emoji.available ? 'Yes' : 'No',
						var6: emoji.managed ? 'Yes' : 'No',
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
				label: 'emojiCreate',
			});
		}
	}
}
module.exports = EmojiCreateEvent;
