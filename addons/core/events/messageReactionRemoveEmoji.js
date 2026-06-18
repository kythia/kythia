/**
 * @namespace: addons/core/events/messageReactionRemoveEmoji.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags } = require('discord.js');
const Sentry = require('@sentry/node');
const { BaseEvent } = require('kythia-core');
class MessageReactionRemoveEmojiEvent extends BaseEvent {
	async execute(reaction) {
		const container = this.container;
		const _bot = {
			client: this.client,
			container: this.container,
		};
		const { kythiaConfig, helpers, models, logger, t } = container;
		const { convertColor } = helpers.color;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
		const guildId = reaction.message.guild?.id;
		const message = reaction.message;
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

			// No specific audit log type for removing a SPECIFIC emoji usually, but it might fall under MessageReactionRemoveEmoji if triggered by a user/bot?
			// Actually there isn't a direct audit log for this specific action often, it's usually just manual removal.
			// We'll skip deep audit log association here unless we find one matching.

			const emojiDisplay = reaction.emoji.id
				? `<:${reaction.emoji.name}:${reaction.emoji.id}>`
				: reaction.emoji.name;
			const components = await simpleContainer(
				{
					client: this.client,
					guildId: guildId,
				},
				`**Reaction Emoji Removed** in <#${message.channelId}>\n\n` +
					`**Emoji:** ${emojiDisplay}\n` +
					`**Message:** [Jump to Message](${message.url})` +
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
				label: 'messageReactionRemoveEmoji',
			});
			if (kythiaConfig?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = MessageReactionRemoveEmojiEvent;
