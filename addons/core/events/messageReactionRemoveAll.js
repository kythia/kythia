/**
 * @namespace: addons/core/events/messageReactionRemoveAll.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags, AuditLogEvent } = require('discord.js');
const Sentry = require('@sentry/node');
const { BaseEvent } = require('kythia-core');
class MessageReactionRemoveAllEvent extends BaseEvent {
	async execute(message, _reactions) {
		const container = this.container;
		const _bot = {
			client: this.client,
			container: this.container,
		};
		const { kythiaConfig, helpers, models, logger, t } = container;
		const { convertColor } = helpers.color;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
		const guildId = message.guild?.id;
		if (!message.guild) return;
		try {
			const settings = await ServerSetting.getCache({
				guildId: message.guild.id,
			});
			if (!settings?.auditLogChannelId) return;
			const logChannel = await helpers.discord.getChannelSafe(
				message.guild,
				settings.auditLogChannelId,
			);
			if (!logChannel?.isTextBased()) return;
			if (
				!logChannel
					.permissionsFor(this.client.user)
					?.has(['ViewChannel', 'SendMessages'])
			)
				return;

			// Try to fetch audit log to see who cleared them
			if (!message.guild.members.me?.permissions?.has('ViewAuditLog')) return;
			const audit = await message.guild
				.fetchAuditLogs({
					type: AuditLogEvent.MessageReactionRemoveAll,
					limit: 1,
				})
				.catch(() => null);
			if (!audit) return;
			const entry = audit.entries.find(
				(e) =>
					e.target.id === message.id && Date.now() - e.createdTimestamp < 5000,
			);
			const executor = entry ? entry.executor : null;
			const components = await simpleContainer(
				{
					client: this.client,
					guildId: guildId,
				},
				`**All Reactions Removed** in <#${message.channelId}>\n\n` +
					`**Message:** [Jump to Message](${message.url})` +
					(executor
						? `\n**Executor:** ${executor.tag} (<@${executor.id}>)`
						: '') +
					'\n\n' +
					(`**Message ID:** ${message.id}\n` +
						`**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>`),
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
				label: 'messageReactionRemoveAll',
			});
			if (kythiaConfig?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = MessageReactionRemoveAllEvent;
