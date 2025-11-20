/**
 * @namespace: addons/globalchat/events/messageCreate.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { handleGlobalChat } = require('../helpers/handleGlobalChat');
const GlobalChat = require('../database/models/GlobalChat');

module.exports = async (bot, message) => {
    if (!message.guild) return;
    const registeredChannel = await GlobalChat.getCache({ globalChannelId: message.channel.id });

    if (!registeredChannel || registeredChannel.guildId !== message.guild.id) {
        return;
    }

    await handleGlobalChat(message, bot.container);
};
