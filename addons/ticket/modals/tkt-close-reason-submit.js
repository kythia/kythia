/**
 * @namespace: addons/ticket/modals/tkt-close-reason-submit.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { closeTicket } = require('../helpers');
const { MessageFlags } = require('discord.js');

module.exports = {
    execute: async (interaction, container) => {
        const { t, helpers } = container;
        const { simpleContainer } = helpers.discord;

        try {
            const reason = interaction.fields.getTextInputValue('reason');

            await closeTicket(interaction, container, reason);
        } catch (error) {
            console.error('Error submitting close w/ reason modal:', error);
            const descError = await t(interaction, 'ticket.errors.close_failed');
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    components: await simpleContainer(interaction, descError, { color: 'Red' }),
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                });
            }
        }
    },
};
