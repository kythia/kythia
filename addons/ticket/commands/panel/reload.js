/**
 * @namespace: addons/ticket/commands/panel/reload.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { MessageFlags } = require('discord.js');
const { refreshTicketPanel } = require('../../helpers');

module.exports = {
    data: (subcommand) =>
        subcommand
            .setName('reload')
            .setDescription('Refreshes a ticket panel (updates buttons & menus).')
            .addStringOption((option) =>
                option.setName('message_id').setDescription('Select the panel to refresh.').setAutocomplete(true).setRequired(true)
            ),

    async autocomplete(interaction, container) {
        const { models } = container;
        const { TicketPanel } = models;

        const focusedValue = interaction.options.getFocused();
        const guildId = interaction.guild.id;

        const panels = await TicketPanel.getAllCache({ guildId });

        if (!panels || panels.length === 0) {
            return interaction.respond([]);
        }

        const filtered = panels.filter(
            (panel) => panel.title.toLowerCase().includes(focusedValue.toLowerCase()) || panel.messageId.includes(focusedValue)
        );

        const options = filtered.slice(0, 25).map((panel) => ({
            name: `${panel.title.substring(0, 50)} (${panel.messageId})`,
            value: panel.messageId,
        }));

        await interaction.respond(options);
    },

    async execute(interaction, container) {
        const { t, helpers } = container;
        const { simpleContainer } = helpers.discord;

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const panelMessageId = interaction.options.getString('message_id');

            await refreshTicketPanel(panelMessageId, container);

            const desc = await t(interaction, 'ticket.panel.reload_success', { id: panelMessageId });

            await interaction.editReply({
                components: await simpleContainer(interaction, desc, { color: 'Green' }),
                flags: MessageFlags.IsComponentsV2,
            });
        } catch (error) {
            console.error('Error reloading panel:', error);
            const desc = await t(interaction, 'ticket.errors.generic');
            await interaction.editReply({
                components: await simpleContainer(interaction, desc, { color: 'Red' }),
            });
        }
    },
};
