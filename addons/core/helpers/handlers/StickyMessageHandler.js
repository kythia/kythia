/**
 * @namespace: addons/core/helpers/handlers/StickyMessageHandler.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	ContainerBuilder,
	TextDisplayBuilder,
} = require('discord.js');
class StickyMessageHandler {
	/**
	 * Handle sticky message logic
	 * @param {Message} message - Discord message
	 * @param {Object} container - Kythia container
	 */
	async handle(message, container) {
		const { models, kythiaConfig, logger, helpers } = container;
		const { StickyMessage } = models;
		const { convertColor } = helpers.color;
		try {
			if (!message.channel || !message.channelId) return;

			// Only skip messages from this bot itself (prevents self-loop).
			// Webhooks and other bots should still trigger the sticky.
			if (
				message.client.user != null &&
				message.author.id === message.client.user.id
			)
				return;
			const sticky = await StickyMessage.getCache({
				channelId: message.channelId,
			});
			if (!sticky) return;
			if (sticky.messageId) {
				const oldMsg = await helpers.discord.getMessageSafe(
					message.channel,
					sticky.messageId,
				);
				if (oldMsg) await oldMsg.delete().catch(() => {});
			}
			const stickyContainer = new ContainerBuilder()
				.setAccentColor(
					convertColor(kythiaConfig.bot.color, {
						from: 'hex',
						to: 'decimal',
					}),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(sticky.message),
				);
			const sent = await message.channel.send({
				components: [stickyContainer],
				flags: MessageFlags.IsComponentsV2,
				allowedMentions: {
					parse: [],
				},
			});
			sticky.messageId = sent.id;
			sticky.changed('messageId', true);
			await sticky.save();
		} catch (err) {
			logger.error(`Error loading sticky: ${err.message || err}`, {
				label: 'StickyMessageHandler',
			});
		}
	}
}
module.exports = StickyMessageHandler;
