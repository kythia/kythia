/**
 * @namespace: addons/fun/register.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const marryButtonHandler = require('./buttons/marry.js');

const initialize = (bot) => {
    const summary = [];
    try {
        bot.registerButtonHandler('marry', marryButtonHandler.execute);

        summary.push("  └─ Button: 'marry'");
    } catch (error) {
        console.error("Failed to register button handler 'marry':", error);
    }

    return summary;
};

module.exports = {
    initialize,
};
