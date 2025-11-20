/**
 * @namespace: addons/ticket/commands/type/delete.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { MessageFlags } = require('discord.js');
const { refreshTicketPanel } = require('../../helpers');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('delete')
            .setDescription('Deletes a ticket type.')
            .addStringOption((option) =>
                option.setName('type_id').setDescription('Select the ticket type to delete.').setAutocomplete(true).setRequired(true)
            ),

    async autocomplete(interaction, container) {
        const { models } = container;
        const { TicketConfig } = models;
        const focusedValue = interaction.options.getFocused();

        const types = await TicketConfig.getAllCache({ guildId: interaction.guild.id });

        if (!types || types.length === 0) return interaction.respond([]);

        const filtered = types.filter((t) => t.typeName.toLowerCase().includes(focusedValue.toLowerCase()));

        await interaction.respond(filtered.slice(0, 25).map((t) => ({ name: t.typeName, value: t.id.toString() })));
    },

    async execute(interaction, container) {
        const { models, t, helpers } = container;
        const { TicketConfig } = models;
        const { simpleContainer } = helpers.discord;

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const typeId = interaction.options.getString('type_id');
            const ticketConfig = await TicketConfig.getCache({ id: typeId });

            if (!ticketConfig) {
                const desc = await t(interaction, 'ticket.errors.config_missing');
                return interaction.editReply({
                    components: await simpleContainer(interaction, desc, { color: 'Red' }),
                });
            }

            const { panelMessageId, typeName } = ticketConfig;

            await ticketConfig.destroy();

            await refreshTicketPanel(panelMessageId, container);

            const desc = await t(interaction, 'ticket.type.delete_success', { typeName });
            await interaction.editReply({
                components: await simpleContainer(interaction, desc, { color: 'Green' }),
                flags: MessageFlags.IsComponentsV2,
            });
        } catch (error) {
            console.error('Error deleting ticket type:', error);
            const desc = await t(interaction, 'ticket.errors.generic');
            await interaction.editReply({
                components: await simpleContainer(interaction, desc, { color: 'Red' }),
            });
        }
    },
};
