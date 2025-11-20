/**
 * @namespace: addons/leveling/events/messageCreate.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const ServerSetting = require('@addons/core/database/models/ServerSetting');
const { addXp } = require('../helpers');
const cooldown = new Map();

/**
 * Auto-claim streak on any message in a guild (except bots).
 * @param {import('../../src/Bot')} bot - Instance of main Bot class.
 * @param {import('discord.js').Message} message - The message object.
 */
module.exports = async (bot, message) => {
    if (message.author.bot || !message.guild) return;
    const guildId = message.guild.id;
    const userId = message.author.id;

    const setting = await ServerSetting.getCache({ guildId });
    if (!setting || !setting.levelingOn) return;

    const xpPerMessage = typeof setting.levelingXp === 'number' ? setting.levelingXp : 15;
    const cooldownTime = typeof setting.levelingCooldown === 'number' ? setting.levelingCooldown : 60000;
    const key = `${guildId}-${userId}`;
    const now = Date.now();

    if (now - (cooldown.get(key) || 0) >= cooldownTime) {
        const channel = message.guild.channels.cache.get(setting.levelingChannelId) || message.channel;
        await addXp(guildId, userId, xpPerMessage, message, channel);
        cooldown.set(key, now);
    }
};
