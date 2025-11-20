/**
 * @namespace: addons/tempvoice/modals/tv_rename_modal.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
module.exports = {
    execute: async (interaction, container) => {
        const { models, t, client } = container;
        const { TempVoiceChannel } = models;
        const newName = interaction.fields.getTextInputValue('channel_name');

        const channelId = interaction.customId.split(':')[1];
        if (!channelId) {
            return interaction.reply({
                content: await t(interaction, 'tempvoice.rename.modal.error.no_id'),
                ephemeral: true,
            });
        }

        const activeChannel = await TempVoiceChannel.getCache({
            channelId: channelId,
            ownerId: interaction.user.id,
        });
        if (!activeChannel) {
            return interaction.reply({
                content: await t(interaction, 'tempvoice.rename.modal.error.not_owner'),
                ephemeral: true,
            });
        }

        const channel = await client.channels.fetch(channelId, { force: true }).catch(() => null);

        if (!channel) {
            return interaction.reply({
                content: await t(interaction, 'tempvoice.rename.modal.error.not_found'),
                ephemeral: true,
            });
        }

        await channel.setName(newName);

        await interaction.reply({
            content: await t(interaction, 'tempvoice.rename.modal.success', { newName }),
            ephemeral: true,
        });
    },
};
