/**
 * @namespace: addons/core/register.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */

const { cleanupUserCache } = require('./helpers/index.js');
const logger = require('@src/utils/logger.js');
const path = require('path');
const { userCache } = require('./helpers/automod.js');

const initialize = (bot) => {
    const summary = [];

    try {
        const reactRoleHandler = require('./buttons/reactrole.js');

        bot.registerButtonHandler('reactrole', reactRoleHandler.execute);
        summary.push("  └─ Button: 'reactrole'");
    } catch (error) {
        logger.error("Error registering button handler 'reactrole':", error);
    }

    setInterval(() => cleanupUserCache(userCache), 1000 * 60 * 60 * 1);
    summary.push('  └─ Interval: cleanup user cache (per hour)');

    return summary;
};

module.exports = {
    initialize,
};
