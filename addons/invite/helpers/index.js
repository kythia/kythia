/**
 * @namespace: addons/invite/helpers/index.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const invitesCache = new Map();

function getGuildInviteCache(guildId) {
    if (!invitesCache.has(guildId)) invitesCache.set(guildId, new Map());
    return invitesCache.get(guildId);
}

async function refreshGuildInvites(guild) {
    try {
        const invites = await guild.invites.fetch();
        const cache = getGuildInviteCache(guild.id);
        cache.clear();
        for (const invite of invites.values()) {
            cache.set(invite.code, { uses: invite.uses || 0, inviterId: invite.inviter?.id || null });
        }
    } catch (e) {}
}

module.exports = {
    getGuildInviteCache,
    refreshGuildInvites,
    invitesCache,
};
