/**
 * @namespace: addons/invite/events/inviteDelete.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */

const { getGuildInviteCache } = require('../helpers');

module.exports = async (bot, invite) => {
    try {
        const cache = getGuildInviteCache(invite.guild.id);
        cache.delete(invite.code);
    } catch {}
};
