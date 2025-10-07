/**
 * @file src/utils/discord.js
 * @description Discord-related helpers for permissions, embeds, and premium checks.
 * Provides utilities to check team membership/premium, build consistent embed footers,
 * and update voice channel status via the HTTP API.
 *
 * Note: relies on global `kythia` for owner and token references.
 *
 * @copyright © 2025 kenndeclouv
 * @version 0.9.9-beta-rc1
 */
const ServerSetting = require('@coreModels/ServerSetting');
const KythiaUser = require('@coreModels/KythiaUser');
const KythiaTeam = require('@coreModels/KythiaTeam');
const { t } = require('@utils/translator');
const logger = require('./logger');
const axios = require('axios');

const isOwner = (userId) => {
    let ownerIds = kythia.owner.ids;
    if (typeof ownerIds === 'string') {
        ownerIds = ownerIds.split(',').map((id) => id.trim());
    }
    if (Array.isArray(ownerIds) && ownerIds.includes(String(userId))) {
        return true;
    }
    return false;
};

/**
 * Checks whether a user is part of the bot owner team.
 * Owner is always considered a team member.
 * @param {{id:string}} user - Discord user object.
 * @returns {Promise<boolean>} True if user is owner or in a team.
 */
async function checkIsTeam(user) {
    if (isOwner(user.id)) return true;

    const teams = await KythiaTeam.getCache({ userId: user.id });
    if (teams.length > 0) return true;

    return false;
}

/**
 * Builds a consistent embed footer with bot username and avatar based on the context.
 * Works for `Interaction`, `Message`, and `GuildMember` sources.
 * @param {object} source - Discord.js object carrying a `client` and possibly `guild`.
 * @returns {Promise<{text:string, iconURL?:string}>}
 */
const embedFooter = async (source) => {
    // Attempt to resolve client for Interaction, Message, and GuildMember
    const client = source.client;

    // Failsafe when client is not available
    if (!client) {
        logger.warn('❌ Cant find client in embedFooter');
        return { text: 'Kythia' }; // Fallback
    }

    const botUser = client.user;

    // Choose translation context: prefer guild if available (for preferredLocale)
    const translationContext = source.guild || source;

    return {
        text: await t(translationContext, 'common_embed_footer', { username: botUser?.username }),
        iconURL: botUser?.displayAvatarURL({ dynamic: true }),
    };
};

/**
 * Checks whether the user has an active premium subscription.
 * The owner is always premium.
 * @param {string} userId - Discord user ID.
 * @returns {Promise<boolean>} True if premium is active.
 */
async function checkIsPremium(userId) {
    if (isOwner(userId)) return true;
    const premium = await KythiaUser.getCache({ userId: userId });
    if (!premium) return false;
    if (premium.premiumExpiresAt && new Date() > premium.premiumExpiresAt) return false;
    return premium.isPremium;
}

/**
 * Sets a custom status message on a voice channel via Discord HTTP API.
 * @param {import('discord.js').VoiceChannel|import('discord.js').BaseVoiceChannel} channel - Voice-capable channel.
 * @param {string} status - Status text to display.
 */
async function setVoiceChannelStatus(channel, status) {
    // Validate channel
    const botToken = kythia.bot.token;
    if (!channel || !channel.isVoiceBased()) {
        logger.error('❌ Invalid voice channel provided.');
        return;
    }

    try {
        await axios.put(
            `https://discord.com/api/v10/channels/${channel.id}/voice-status`,
            { status: status },
            { headers: { Authorization: `Bot ${botToken}` } }
        );
    } catch (e) {
        logger.error('❌ Failed to set voice channel status:', e.response?.data || e.message);
    }
}

module.exports = { isOwner, checkIsTeam, embedFooter, checkIsPremium, setVoiceChannelStatus };
