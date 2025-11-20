/**
 * @namespace: addons/core/helpers/index.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { t } = require('@coreHelpers/translator');
const logger = require('@coreHelpers/logger');

/**
 * Set role prefix to member nicknames, with translation for logs.
 * @param {import('discord.js').Guild} guild
 * @param {object} interaction - Discord interaction/message for translation context
 */
async function rolePrefix(guild, interaction) {
    // const prefixPattern = /^[\[\(（【「].+?[\]\)）】」]/;
    const prefixPattern = /^([^\w\d\s]{1,5}(?:\s?•)?)/;

    const prefixRoles = guild.roles.cache
        .filter((role) => prefixPattern.test(role.name))
        .sort((a, b) => b.position - a.position)
        .map((role) => {
            const match = role.name.match(prefixPattern);
            return {
                roleId: role.id,
                prefix: match ? match[1] : '',
                position: role.position,
            };
        });

    let updated = 0;

    for (const member of guild.members.cache.values()) {
        // allow if member is the bot itself
        const isBotSelf = member.id === guild.client.user.id;

        if (!member.manageable && !isBotSelf) {
            const logMsg = 'Member cannot be managed: ' + (member.nickname || member.user.username);
            logger.info(logMsg);
            continue;
        }

        const matching = prefixRoles.find((r) => member.roles.cache.has(r.roleId));
        if (!matching) continue;

        const currentNick = member.nickname || member.user.username;
        const baseName = currentNick.replace(prefixPattern, '').trimStart();
        const newNick = `${matching.prefix} ${baseName}`;

        if (currentNick !== newNick) {
            try {
                await member.setNickname(newNick);
                updated++;
            } catch (err) {
                const warnMsg = '❌ Failed to update nickname for ' + member.user.tag + ': ' + err.message;
                logger.warn(warnMsg);
            }
        }
    }

    return updated;
}

/**
 * Remove role prefix from member nicknames, with translation for logs.
 * @param {import('discord.js').Guild} guild
 * @param {object} interaction - Discord interaction/message for translation context
 */
async function roleUnprefix(guild, interaction) {
    const prefixPattern = /^([^\w\d\s]{1,5}(?:\s?•)?)\s?/;

    let updated = 0;

    for (const member of guild.members.cache.values()) {
        const isBotSelf = member.id === guild.client.user.id;

        if (!member.manageable && !isBotSelf) {
            const logMsg = await t(interaction, 'core.helpers.index.member.not.manageable', {
                name: member.nickname || member.user.username,
            });
            logger.info(logMsg);
            continue;
        }

        const currentNick = member.nickname;
        if (!currentNick || !prefixPattern.test(currentNick)) continue;

        const baseName = currentNick.replace(prefixPattern, '');

        if (currentNick !== baseName) {
            try {
                await member.setNickname(baseName);
                updated++;
            } catch (err) {
                const warnMsg = await t(interaction, 'core.helpers.index.failed.nick.update', {
                    tag: member.user.tag,
                    error: err.message,
                });
                logger.warn(warnMsg);
            }
        }
    }

    return updated;
}

/**
 * Clean up user cache, with translation for logs.
 * @param {Map} userCache
 * @param {object} interaction - Discord interaction/message for translation context
 */
async function cleanupUserCache(userCache) {
    if (!userCache || typeof userCache.entries !== 'function') {
        const warnMsg = '⚠️ User cache is invalid or not iterable.';
        logger.warn(warnMsg);
        return;
    }

    const now = Date.now();
    const expirationTime = 12 * 60 * 60 * 1000; // 12 hours buffer

    for (const [key, userData] of userCache.entries()) {
        if (!userData || !Array.isArray(userData.duplicateMessages)) {
            userCache.delete(key);
            continue;
        }
        const lastMessage = userData.duplicateMessages[userData.duplicateMessages.length - 1];

        // If user has no messages, or last message is older than 12 hours
        if (!lastMessage || now - lastMessage.createdTimestamp > expirationTime) {
            userCache.delete(key);
        }
    }
    const logMsg = '🧹 [CACHE CLEANUP] userCache cleaned';
    logger.info(logMsg);
}

module.exports = {
    rolePrefix,
    roleUnprefix,
    cleanupUserCache,
};
