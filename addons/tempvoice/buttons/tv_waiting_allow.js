/**
 * @namespace: addons/tempvoice/buttons/tv_waiting_allow.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
module.exports = {
    execute: async (interaction, container) => {
        const { models, client, t, helpers } = container;
        const { simpleContainer } = helpers.discord;
        const { TempVoiceChannel } = models;

        const [_, mainChannelId, userIdToMove] = interaction.customId.split(':');

        // 1. Cek kepemilikan
        const activeChannel = await TempVoiceChannel.getCache({
            channelId: mainChannelId,
            ownerId: interaction.user.id,
        });
        if (!activeChannel) return interaction.reply({ content: await t(interaction, 'tempvoice.common.not_owner'), ephemeral: true });

        // 2. Fetch channel & user
        const mainChannel = await client.channels.fetch(mainChannelId, { force: true }).catch(() => null);
        const member = await interaction.guild.members.fetch(userIdToMove).catch(() => null);

        if (!mainChannel || !member)
            return interaction.reply({ content: await t(interaction, 'tempvoice.waiting.user_or_channel_gone'), ephemeral: true });

        // 3. Pindahin user
        try {
            await member.voice.setChannel(mainChannel);
            await interaction.message.delete(); // Hapus pesan notif
        } catch (e) {
            await interaction.reply({ content: await t(interaction, 'tempvoice.waiting.move_fail'), ephemeral: true });
        }
    },
};
