/**
 * @namespace: addons/ai/events/messageCreate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const AIMessageHandler = require('../helpers/handlers/AIMessageHandler');

let messageHandler;

/**
 * AI Message Create Event Handler
 * Delegates all processing to AIMessageHandler class
 */

const { BaseEvent } = require('kythia-core');

class MessageCreateEvent extends BaseEvent {
	async execute(message) {
		const _container = this.container;
		const bot = { client: this.client, container: this.container };

		const logger = this.container?.logger;

		// DEBUG: confirm the handler is being reached
		// logger?.debug(
		// 	`[AI event] reached — author: ${message.author?.id}, content: ${String(message.content).slice(0, 80)}`,
		// 	{ label: 'ai' },
		// );

		// Ignore messages starting with modmail prefix
		const modmailPrefix = this.container?.kythiaConfig?.addons?.modmail?.prefix;
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
				messageHandler = new AIMessageHandler(this.container);
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
	}
}

module.exports = MessageCreateEvent;
