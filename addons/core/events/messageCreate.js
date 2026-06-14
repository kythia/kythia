/**
 * @namespace: addons/core/events/messageCreate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const PrefixCommandHandler = require('../helpers/handlers/PrefixCommandHandler');
const AFKHandler = require('../helpers/handlers/AFKHandler');
const StickyMessageHandler = require('../helpers/handlers/StickyMessageHandler');
const ErrorHandler = require('../helpers/handlers/ErrorHandler');

const { BaseEvent } = require('kythia-core');

class MessageCreateEvent extends BaseEvent {
	async execute(message) {
		const container = this.container;
		const _bot = { client: this.client, container: this.container };

		const _client = this.client;

		try {
			const { models, logger } = container;
			const { KythiaBlacklist } = models;

			// 0. Global Blacklist Checks (Stop propagation if true)
			if (message.author && !message.author.bot) {
				const userBlacklisted = await KythiaBlacklist.getCache({
					where: { type: 'user', targetId: message.author.id },
				}).catch(() => null);

				if (userBlacklisted) {
					logger.info(
						`Blocked message from blacklisted user: ${message.author.tag} (${message.author.id})`,
						{ label: 'blacklist' },
					);
					return true; // Stop propagation to other addons
				}
			}

			if (message.guild) {
				const guildBlacklisted = await KythiaBlacklist.getCache({
					where: { type: 'guild', targetId: message.guild.id },
				}).catch(() => null);

				if (guildBlacklisted) {
					logger.info(
						`Blocked message from blacklisted guild: ${message.guild.name} (${message.guild.id})`,
						{ label: 'blacklist' },
					);
					return true; // Stop propagation to other addons
				}
			}

			// 1. Try prefix command handling
			const prefixHandler = new PrefixCommandHandler();
			const handled = await prefixHandler.handle(message, container);
			if (handled) return;

			// 2. Guild-only features
			if (message.guild) {
				// Automod is now handled by the automod addon's own messageCreate listener

				// AFK system
				const afkHandler = new AFKHandler();
				await afkHandler.handle(message, container);

				// Sticky messages
				const stickyHandler = new StickyMessageHandler();
				await stickyHandler.handle(message, container);
			}
		} catch (error) {
			// Centralized error handling
			const errorHandler = new ErrorHandler();
			await errorHandler.handle(error, message, container);
		}
	}
}

module.exports = MessageCreateEvent;
