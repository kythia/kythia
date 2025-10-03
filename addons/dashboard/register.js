/**
 * @namespace: addons/dashboard/register.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */

// addons/dashboard/register.js

const { initializeStatusMonitor, initializeDatabasePruning } = require('./tasks/statusMonitor');
const initializeDashboard = require('./web/server');

module.exports = {
    /**
     * Fungsi initialize ini akan dipanggil oleh command handler utama (Bot.js)
     * saat memuat semua addon.
     * @param {Bot} bot Instance dari kelas Bot utama.
     */
    async initialize(bot) {
        const summery = [];
        // initializeStatusMonitor(bot.container.client);
        // summery.push('   └─ Task: Status Monitor (Cron Job)');
        // initializeDatabasePruning();
        // summery.push('   └─ Task: Database Prunning (Cron Job)');
        initializeDashboard(bot.container.client);
        summery.push('   └─ 🚀 Initializing Dashboard...');

        return summery;
    },
};
