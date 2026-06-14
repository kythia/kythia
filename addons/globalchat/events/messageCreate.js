/**
 * @namespace: addons/globalchat/events/messageCreate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { handleGlobalChat } = require('../helpers/handleGlobalChat');

const { BaseEvent } = require('kythia-core');

class MessageCreateEvent extends BaseEvent {
	async execute(message) {
		const container = this.container;
		const _bot = { client: this.client, container: this.container };

		if (!message.guild) return;
		const { models } = container;
		const { GlobalChat } = models;

		const registeredChannel = await GlobalChat.getCache({
			globalChannelId: message.channel.id,
		});

		if (!registeredChannel || registeredChannel.guildId !== message.guild.id) {
			return;
		}

		await handleGlobalChat(message, this.container);
	}
}

module.exports = MessageCreateEvent;
