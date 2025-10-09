/**
 * @namespace: addons/music/register.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */

const initializeMusicManager = require('./helpers/musicManager');

module.exports = {
    async initialize(bot) {
        const summary = [];
        await initializeMusicManager(bot);
        summary.push('   └─ 🎵 Initialize Music Manager');
        return summary;
    },
};
