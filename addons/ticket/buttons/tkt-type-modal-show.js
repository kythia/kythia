/**
 * @namespace: addons/ticket/buttons/tkt-type-modal-show.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { ModalBuilder, LabelBuilder, TextInputBuilder, TextInputStyle, MessageFlags, ChannelType } = require('discord.js');

module.exports = {
    execute: async (interaction, container) => {
        const { t, helpers } = container;
        const { simpleContainer } = helpers.discord;

        try {
            const modal = new ModalBuilder()
                .setCustomId('tkt-type-create')
                .setTitle('Create New Ticket Type')
                .addLabelComponents(
                    new LabelBuilder()
                        .setLabel('Ticket Type Name (Label in Menu)')
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
                                .setPlaceholder('e.g. 🌸')
                                .setRequired(false)
                        ),
                    new LabelBuilder()
                        .setLabel('Channel Category ID (Optional)')
                        .setDescription('Category ID where new tickets are created')
                        .setChannelSelectMenuComponent(
                            new ChannelSelectMenuBuilder()
                                .setCustomId('ticketCategoryId')
                                .setPlaceholder('Select a category...')
                                .addChannelTypes(ChannelType.GuildCategory)
                                .setRequired(true)
                                .setMinValues(1)
                                .setMaxValues(1)
                        ),
                    new LabelBuilder()
                        .setLabel('Opening Ticket Message (Optional)')
                        .setTextInputComponent(
                            new TextInputBuilder()
                                .setCustomId('ticketOpenMessage')
                                .setStyle(TextInputStyle.Paragraph)
                                .setPlaceholder('This message will be sent in the new ticket channel. {user} will be mentioned.')
                                .setRequired(false)
                        ),
                    new LabelBuilder()
                        .setLabel('Opening Ticket Image (Optional)')
                        .setTextInputComponent(
                            new TextInputBuilder()
                                .setCustomId('ticketOpenImage')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder('https://... (Image URL for the ticket)')
                                .setRequired(false)
                        )
                );

            await interaction.showModal(modal);
        } catch (error) {
            console.error('Error in tkt-type-modal-show handler:', error);
            if (!interaction.replied && !interaction.deferred) {
                const desc = await t(interaction, 'ticket.errors.modal_show_failed_type');
                await interaction.reply({
                    components: await simpleContainer(interaction, desc, { color: 'Red' }),
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                });
            }
        }
    },
};
