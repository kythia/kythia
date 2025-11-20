/**
 * @namespace: addons/ticket/modals/tkt-open-reason.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { createTicketChannel } = require('../helpers');
const { MessageFlags } = require('discord.js');

module.exports = {
    execute: async (interaction, container) => {
        const { models, t, helpers } = container;
        const { TicketConfig } = models;
        const { simpleContainer } = helpers.discord;

        try {
            const configId = interaction.customId.split(':')[1];
            const reason = interaction.fields.getTextInputValue('reason');

            const ticketConfig = await TicketConfig.getCache({ id: configId });
            if (!ticketConfig) {
                const desc = await t(interaction, 'ticket.errors.invalid_config');
                return interaction.reply({
                    components: await simpleContainer(interaction, desc, { color: 'Red' }),
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                });
            }

            await createTicketChannel(interaction, ticketConfig, container, reason);
        } catch (error) {
            console.error('Error di tkt-open-reason handler:', error);
            const descError = await t(interaction, 'ticket.errors.create_failed');
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    components: await simpleContainer(interaction, descError, { color: 'Red' }),
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                });
            } else {
                await interaction.reply({
                    components: await simpleContainer(interaction, descError, { color: 'Red' }),
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                });
            }
        }
    },
};
