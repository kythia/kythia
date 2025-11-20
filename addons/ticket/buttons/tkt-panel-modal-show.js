/**
 * @namespace: addons/ticket/buttons/tkt-panel-modal-show.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const {
    ModalBuilder,
    LabelBuilder,
    TextInputBuilder,
    TextInputStyle,
    ChannelSelectMenuBuilder,
    ChannelType,
    MessageFlags,
} = require('discord.js');

module.exports = {
    execute: async (interaction, container) => {
        const { t, helpers } = container;
        const { simpleContainer } = helpers.discord;
        const originalMessageId = interaction.message.id;

        try {
            const modal = new ModalBuilder()
                .setCustomId(`tkt-panel-create:${originalMessageId}`)
                .setTitle('Create New Panel')
                .addLabelComponents(
                    new LabelBuilder()
                        .setLabel('Panel Channel')
                        .setDescription('Select the channel where this panel will be sent.')
                        .setChannelSelectMenuComponent(
                            new ChannelSelectMenuBuilder()
                                .setCustomId('channelId')
                                .setPlaceholder('Select a channel...')
                                .addChannelTypes(ChannelType.GuildText)
                                .setMinValues(1)
                                .setMaxValues(1)
                        ),

                    new LabelBuilder()
                        .setLabel('Panel Title')
                        .setTextInputComponent(
                            new TextInputBuilder()
                                .setCustomId('title')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder('e.g. Kythia Support Center')
                                .setRequired(true)
                        ),
                    new LabelBuilder()
                        .setLabel('Panel Description')
                        .setTextInputComponent(
                            new TextInputBuilder()
                                .setCustomId('description')
                                .setStyle(TextInputStyle.Paragraph)
                                .setPlaceholder('Select the type of ticket you need below.')
                                .setRequired(false)
                        ),
                    new LabelBuilder()
                        .setLabel('Panel Image URL (Optional)')
                        .setTextInputComponent(
                            new TextInputBuilder()
                                .setCustomId('image')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder('https://... (Image URL for panel)')
                                .setRequired(false)
                        )
                );

            await interaction.showModal(modal);
        } catch (error) {
            console.error('Error in tkt-panel-modal-show handler:', error);
            if (!interaction.replied && !interaction.deferred) {
                const desc = await t(interaction, 'ticket.errors.modal_show_failed_panel');
                await interaction.reply({
                    components: await simpleContainer(interaction, desc, { color: 'Red' }),
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                });
            }
        }
    },
};
