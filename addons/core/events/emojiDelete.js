/**
 * @namespace: addons/core/events/emojiDelete.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { AuditLogEvent, MessageFlags } = require('discord.js');
const { BaseEvent } = require('kythia-core');
class EmojiDeleteEvent extends BaseEvent {
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
					type: AuditLogEvent.EmojiDelete,
					limit: 1,
				})
				.catch(() => null);
			if (!audit) return;
			const entry = audit.entries.find(
				(e) =>
					e.target?.id === emoji.id && e.createdTimestamp > Date.now() - 5000,
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
					'core.events.emojiDelete.log',
					{
						var0: executor?.id || 'Unknown',
						name: emoji.name,
						var2: emoji.animated ? 'Yes' : 'No',
						var3: emoji.available ? 'Yes' : 'No',
						var4: emoji.managed ? 'Yes' : 'No',
						conditional5: entry.reason
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
						var6: executor?.tag || 'Unknown',
						var7: executor?.id || 'Unknown',
						var8: Math.floor(Date.now() / 1000),
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
				label: 'emojiDelete',
			});
		}
	}
}
module.exports = EmojiDeleteEvent;
