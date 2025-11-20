/**
 * @namespace: addons/tempvoice/buttons/tv_rename.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    execute: async (interaction, container) => {
        const { models, t } = container;
        const { TempVoiceChannel } = models;

        const activeChannel = await TempVoiceChannel.getCache({
            ownerId: interaction.user.id,
            guildId: interaction.guild.id,
        });

        if (!activeChannel) {
            return interaction.reply({ content: await t(interaction, 'tempvoice.rename.no_active_channel'), ephemeral: true });
        }

        const modal = new ModalBuilder()
            .setCustomId(`tv_rename_modal:${activeChannel.channelId}`)
            .setTitle(await t(interaction, 'tempvoice.rename.modal_title'));

        const nameInput = new TextInputBuilder()
            .setCustomId('channel_name')
            .setLabel(await t(interaction, 'tempvoice.rename.input_label'))
            .setStyle(TextInputStyle.Short)
            .setPlaceholder(await t(interaction, 'tempvoice.rename.input_placeholder'))
            .setRequired(true)
            .setMaxLength(100);

        const row = new ActionRowBuilder().addComponents(nameInput);
        modal.addComponents(row);

        await interaction.showModal(modal);
    },
};
