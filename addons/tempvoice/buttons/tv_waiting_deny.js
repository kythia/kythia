/**
 * @namespace: addons/tempvoice/buttons/tv_waiting_deny.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
module.exports = {
    execute: async (interaction, container) => {
        const { models, client, t, helpers } = container;
        const { TempVoiceChannel } = models;

        const [_, mainChannelId, userIdToKick] = interaction.customId.split(':');

        // 1. Cek kepemilikan
        const activeChannel = await models.TempVoiceChannel.getCache({
            channelId: mainChannelId,
            ownerId: interaction.user.id,
        });
        if (!activeChannel) return interaction.reply({ content: await t(interaction, 'tempvoice.common.not_owner'), ephemeral: true });

        // 2. Fetch user
        const member = await interaction.guild.members.fetch(userIdToKick).catch(() => null);
        if (!member) return interaction.reply({ content: await t(interaction, 'tempvoice.waiting.user_or_channel_gone'), ephemeral: true });

        // 3. Kick user
        try {
            await member.voice.disconnect(await t(interaction, 'tempvoice.waiting.deny_reason'));
            await interaction.message.delete(); // Hapus pesan notif
        } catch (e) {
            await interaction.reply({ content: await t(interaction, 'tempvoice.waiting.kick_fail'), ephemeral: true });
        }
    },
};
