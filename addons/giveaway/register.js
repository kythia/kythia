/**
 * @namespace: addons/giveaway/register.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */

// addons/giveaway/register.js
const path = require('path');
const { initializeGiveawayScheduler } = require('./tasks/giveawayScheduler');

const initialize = (bot) => {
    const summary = [];
    try {
        const giveawayJoinButtonHandler = require('./buttons/giveawayjoin.js');

        bot.registerButtonHandler('giveawayjoin', giveawayJoinButtonHandler.execute);

        summary.push("  └─ Button: 'giveawayjoin'");
    } catch (error) {
        console.error("Failed to register button handler 'giveawayjoin':", error);
    }

    bot.addReadyHook(() => {
        initializeGiveawayScheduler(bot.client);
    });

    summary.push('  └─ Task: Giveaway Scheduler (Cron Job)');
    return summary;
};

module.exports = {
    initialize,
};
