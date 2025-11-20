/**
 * @namespace: addons/ticket/buttons/tkt-type-step1-show.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { ModalBuilder, LabelBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, MessageFlags } = require('discord.js');

module.exports = {
    execute: async (interaction, container) => {
        const { t, helpers, models } = container;
        const { simpleContainer } = helpers.discord;
        const { TicketPanel } = models;

        try {
            const messageId = interaction.message.id;

            const panels = await TicketPanel.getAllCache({ guildId: interaction.guild.id });
            if (!panels || panels.length === 0) {
                const desc = await t(interaction, 'ticket.errors.no_panels_found');
                return interaction.reply({
                    components: await simpleContainer(interaction, desc, { color: 'Red' }),
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                });
            }

            const panelOptions = panels.map((panel) => ({
                label: panel.title.slice(0, 100),
                description: `Panel in #${interaction.guild.channels.cache.get(panel.channelId)?.name || panel.channelId}`,
                value: panel.messageId,
            }));

            const modal = new ModalBuilder()
                .setCustomId(`tkt-type-step1-submit:${messageId}`)
                .setTitle('Create Type - Step 1/2: Basic Info')
                .addLabelComponents(
                    new LabelBuilder()
                        .setLabel('Select Target Panel')
                        .setStringSelectMenuComponent(
                            new StringSelectMenuBuilder()
                                .setCustomId('panelId')
                                .setPlaceholder('Select panel...')
                                .setOptions(panelOptions)
                                .setMinValues(1)
                                .setMaxValues(1)
                        ),
                    new LabelBuilder()
                        .setLabel('Ticket Type Name (Menu Label)')
                        .setTextInputComponent(
                            new TextInputBuilder()
                                .setCustomId('typeName')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder('e.g. Bug Report')
                                .setRequired(true)
                        ),
                    new LabelBuilder()
                        .setLabel('Type Emoji (Optional)')
                        .setTextInputComponent(
                            new TextInputBuilder()
                                .setCustomId('typeEmoji')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder('e.g. 🎟️')
                                .setRequired(false)
                        ),
                    new LabelBuilder()
                        .setLabel('Ticket Opening Message (Optional)')
                        .setTextInputComponent(
                            new TextInputBuilder()
                                .setCustomId('ticketOpenMessage')
                                .setStyle(TextInputStyle.Paragraph)
                                .setPlaceholder('This message will be sent in the new ticket channel.')
                                .setRequired(false)
                        ),
                    new LabelBuilder()
                        .setLabel('Ticket Opening Image (Optional)')
                        .setTextInputComponent(
                            new TextInputBuilder()
                                .setCustomId('ticketOpenImage')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder('https://... (Image URL)')
                                .setRequired(false)
                        )
                );

            await interaction.showModal(modal);
        } catch (error) {
            console.error('Error in tkt-type-step1-show handler:', error);
            if (!interaction.replied && !interaction.deferred) {
                const desc = await t(interaction, 'ticket.errors.modal_show_failed');
                await interaction.reply({
                    components: await simpleContainer(interaction, desc, { color: 'Red' }),
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                });
            }
        }
    },
};
