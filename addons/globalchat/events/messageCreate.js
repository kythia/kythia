/**
 * @namespace: addons/globalchat/events/messageCreate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { handleGlobalChat } = require('../helpers/handleGlobalChat');

module.exports = async (bot, message) => {
	if (!message.guild) return;
	const { container } = bot;
	const { models } = container;
	const { GlobalChat } = models;

	const registeredChannel = await GlobalChat.getCache({
		globalChannelId: message.channel.id,
	});

	if (!registeredChannel || registeredChannel.guildId !== message.guild.id) {
		return;
	}

	await handleGlobalChat(message, bot.container);
};
