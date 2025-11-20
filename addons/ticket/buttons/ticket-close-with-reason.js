/**
 * @namespace: addons/ticket/buttons/ticket-close-with-reason.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { ModalBuilder, LabelBuilder, TextInputBuilder, TextInputStyle, MessageFlags } = require('discord.js');

module.exports = {
    execute: async (interaction, container) => {
        const { t, helpers } = container;
        const { simpleContainer } = helpers.discord;

        try {
            const modal = new ModalBuilder()
                .setCustomId('tkt-close-reason-submit')
                .setTitle(await t(interaction, 'ticket.claim_modal.title'))
                .addLabelComponents(
                    new LabelBuilder().setLabel(await t(interaction, 'ticket.claim_modal.label')).setTextInputComponent(
                        new TextInputBuilder()
                            .setCustomId('reason')
                            .setStyle(TextInputStyle.Paragraph)
                            .setPlaceholder(await t(interaction, 'ticket.claim_modal.placeholder'))
                            .setRequired(true)
                            .setMinLength(5)
                            .setMaxLength(512)
                    )
                );
            await interaction.showModal(modal);
        } catch (error) {
            console.error('Error showing close w/ reason modal:', error);
            const desc = await t(interaction, 'ticket.errors.modal_show_failed');
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    components: await simpleContainer(interaction, desc, { color: 'Red' }),
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                });
            }
        }
    },
};
