/**
 * @namespace: addons/invite/events/inviteCreate.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { getGuildInviteCache } = require('../helpers');

module.exports = async (bot, invite) => {
    try {
        const cache = getGuildInviteCache(invite.guild.id);
        cache.set(invite.code, { uses: invite.uses || 0, inviterId: invite.inviter?.id || null });
    } catch {}
};
