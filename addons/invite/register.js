/**
 * @namespace: addons/invite/register.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */

const { refreshGuildInvites } = require('./helpers');

const initialize = (bot) => {
    const summary = [];
    bot.addReadyHook(async (client) => {
        for (const [, guild] of client.guilds.cache) {
            await refreshGuildInvites(guild);
        }
    });
    summary.push('  └─ ReadyHook: warm invite caches');
    return summary;
};

module.exports = {
    initialize,
};
