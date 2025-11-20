/**
 * @namespace: addons/core/helpers/discord.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } = require('discord.js');

const KythiaUser = require('@coreModels/KythiaUser');
const KythiaTeam = require('@coreModels/KythiaTeam');
const { t } = require('@coreHelpers/translator');
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
async function isTeam(user) {
    if (isOwner(user.id)) return true;
    const teams = await KythiaTeam.getCache({ userId: user.id });
    return !!(teams && teams.length);
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
        text: await t(translationContext, 'common.embed.footer', { username: botUser?.username }),
        iconURL: botUser?.displayAvatarURL({ dynamic: true }),
    };
};

/**
 * Checks whether the user has an active premium subscription.
 * The owner is always premium.
 * @param {string} userId - Discord user ID.
 * @returns {Promise<boolean>} True if premium is active.
 */
async function isPremium(userId) {
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
        logger.warn('❌ Invalid voice channel provided.');
        return;
    }

    try {
        await axios.put(
            `https://discord.com/api/v10/channels/${channel.id}/voice-status`,
            { status: status },
            { headers: { Authorization: `Bot ${botToken}` } }
        );
    } catch (e) {
        logger.warn('❌ Failed to set voice channel status:', e.response?.data || e.message);
    }
}

/**
 * Checks whether the user has an active Top.gg vote (i.e., isVoted && not expired).
 * @param {string} userId - Discord user ID.
 * @returns {Promise<boolean>} True if the user has an active vote.
 */
async function isVoterActive(userId) {
    const user = await KythiaUser.getCache({ userId });
    if (!user) return false;
    if (!user.isVoted || !user.voteExpiresAt || new Date() > user.voteExpiresAt) return false;
    return true;
}

/**
 * Create a simple Discord container reply with optional color & auto-footer.
 * @param {object} interaction - Discord interaction (for t)
 * @param {object} container - Dependency injection
 * @param {string} content - Main response text
 * @param {object} [options={}] - Extra options
 * @param {string} [options.color] - Accent color (hex/discord)
 * @returns {Promise<object>} - Discord reply obj ({ components, flags })
 */
async function simpleContainer(interaction, content, options = {}) {
    const { kythiaConfig, helpers, t } = interaction.client.container;
    const { convertColor } = helpers.color;
    const { color } = options;

    // Get accent color
    let accentColor = color
        ? convertColor(color, { from: 'discord', to: 'decimal' }) || convertColor(color, { from: 'hex', to: 'decimal' })
        : convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' });

    // Build container
    const replyContainer = new ContainerBuilder()
        .setAccentColor(accentColor)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(content))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                await t(interaction, 'common.container.footer', { username: interaction.client.user.username })
            )
        );

    return [replyContainer];
}

module.exports = { isOwner, isTeam, embedFooter, isPremium, setVoiceChannelStatus, isVoterActive, simpleContainer };
