/**
 * @namespace: addons/ai/events/messageCreate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const AIMessageHandler = require('../helpers/handlers/AIMessageHandler');

let messageHandler;

/**
 * AI Message Create Event Handler
 * Delegates all processing to AIMessageHandler class
 */
module.exports = async (bot, message) => {
	const logger = bot.container?.logger;

	// DEBUG: confirm the handler is being reached
	// logger?.debug(
	// 	`[AI event] reached — author: ${message.author?.id}, content: ${String(message.content).slice(0, 80)}`,
	// 	{ label: 'ai' },
	// );

	// Ignore messages starting with modmail prefix
	const modmailPrefix = bot.container?.kythiaConfig?.addons?.modmail?.prefix;
	if (
		modmailPrefix &&
		typeof message.content === 'string' &&
		message.content.startsWith(modmailPrefix)
	) {
		return;
	}

	// Lazy initialization of handler
	if (!messageHandler) {
		try {
			messageHandler = new AIMessageHandler(bot.container);
			// logger?.debug('[AI event] AIMessageHandler initialized', { label: 'ai' });
		} catch (err) {
			logger?.error(
				`[AI event] Failed to init AIMessageHandler: ${err.message}`,
				{ label: 'ai' },
			);
			return;
		}
	}

	await messageHandler.handleMessage(bot, message);
};
