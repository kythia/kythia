/**
 * @namespace: addons/invite/register.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { refreshGuildInvites } = require('./helpers');

const initialize = (bot) => {
    const summary = [];
    bot.addClientReadyHook(async (client) => {
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
