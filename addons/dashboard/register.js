/**
 * @namespace: addons/dashboard/register.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */

const initializeDashboard = require('./web/server');

module.exports = {
    async initialize(bot) {
        const summery = [];
        initializeDashboard(bot.container.client);
        summery.push('   └─ 🚀 Initializing Dashboard...');

        return summery;
    },
};
