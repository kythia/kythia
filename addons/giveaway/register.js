/**
 * @namespace: addons/giveaway/register.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const GiveawayManager = require('./helpers/GiveawayManager');
const giveawayJoinButton = require('./buttons/giveaway-join');

module.exports = {
    async initialize(bot) {
        const container = bot.client.container;
        const summary = [];

        container.giveawayManager = new GiveawayManager(container);

        bot.registerButtonHandler('giveaway-join', (interaction) => {
            return giveawayJoinButton.execute(interaction, container);
        });
        bot.addClientReadyHook(async () => {
            await container.giveawayManager.init();
        });

        summary.push('   └─ 🎁 Giveaway Manager (Scheduler Queued)');

        return summary;
    },
};
