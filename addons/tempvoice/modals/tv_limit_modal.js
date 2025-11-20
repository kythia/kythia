/**
 * @namespace: addons/tempvoice/modals/tv_limit_modal.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
module.exports = {
    execute: async (interaction, container) => {
        const { models, t, client } = container;
        const { TempVoiceChannel } = models;
        const newLimitStr = interaction.fields.getTextInputValue('user_limit');
        const newLimit = parseInt(newLimitStr, 10);
        const channelId = interaction.customId.split(':')[1];

        if (isNaN(newLimit) || newLimit < 0 || newLimit > 99) {
            return interaction.reply({ content: await t(interaction, 'tempvoice.limit.modal.invalid_input'), ephemeral: true });
        }
        if (!channelId) {
            return interaction.reply({ content: await t(interaction, 'tempvoice.limit.modal.channel_id_not_found'), ephemeral: true });
        }

        const activeChannel = await TempVoiceChannel.getCache({
            channelId: channelId,
            ownerId: interaction.user.id,
        });
        if (!activeChannel) {
            return interaction.reply({ content: await t(interaction, 'tempvoice.limit.modal.not_owner'), ephemeral: true });
        }

        const channel = await client.channels.fetch(channelId, { force: true }).catch(() => null);
        if (!channel) {
            return interaction.reply({ content: await t(interaction, 'tempvoice.limit.modal.channel_not_found'), ephemeral: true });
        }

        await channel.setUserLimit(newLimit);
        await interaction.reply({
            content: await t(interaction, 'tempvoice.limit.modal.success', {
                limit: newLimit === 0 ? await t(interaction, 'tempvoice.limit.modal.unlimited') : newLimit,
            }),
            ephemeral: true,
        });
    },
};
