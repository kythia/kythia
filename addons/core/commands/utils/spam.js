/**
 * @namespace: addons/core/commands/utils/spam.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */
const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits } = require('discord.js');
const { t } = require('@utils/translator');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('spam')
        .setDescription('💬 Mass send messages to this channel.')
        .addStringOption((opt) => opt.setName('pesan').setDescription('Message to send').setRequired(true))
        .addIntegerOption((opt) =>
            opt
                .setName('jumlah')
                .setDescription('How many times to send the message (max 20)')
                .setMinValue(1)
                .setMaxValue(20)
                .setRequired(true)
        )
        .addIntegerOption((opt) =>
            opt
                .setName('delay')
                .setDescription('Delay between messages (ms, minimum 250)')
                .setMinValue(250)
                .setMaxValue(60000)
                .setRequired(false)
        )
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    guildOnly: true,
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const pesan = interaction.options.getString('pesan');
        const jumlah = interaction.options.getInteger('jumlah');
        const delay = interaction.options.getInteger('delay') ?? 1000;

        if (pesan.length > 2000) {
            return interaction.editReply({ content: await t(interaction, 'core_utils_spam_too_long', { max: 2000 }) });
        }
        if (jumlah > 20) {
            return interaction.editReply({ content: await t(interaction, 'core_utils_spam_too_many', { max: 20 }) });
        }
        if (delay < 250) {
            return interaction.editReply({ content: await t(interaction, 'core_utils_spam_too_fast', { min: 250 }) });
        }

        // Kirim pesan ke channel tempat command dipanggil
        let sent = 0;
        const channel = interaction.channel;

        // Fungsi delay
        const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

        // Cek permission
        if (!channel || !channel.permissionsFor?.(interaction.client.user)?.has('SendMessages')) {
            return interaction.editReply({ content: await t(interaction, 'core_utils_spam_no_permission') });
        }

        await interaction.editReply({ content: await t(interaction, 'core_utils_spam_start', { jumlah, delay }) });

        for (let i = 0; i < jumlah; i++) {
            try {
                await channel.send(pesan);
                sent++;
                if (i < jumlah - 1) await sleep(delay);
            } catch (err) {
                break;
            }
        }

        // Beri info selesai
        try {
            await interaction.followUp({ content: await t(interaction, 'core_utils_spam_done', { sent }), ephemeral: true });
        } catch (e) {
            // ignore
        }
    },
};
