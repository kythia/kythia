/**
 * @namespace: addons/core/commands/utils/presence.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { SlashCommandBuilder, ActivityType, InteractionContextType } = require('discord.js');

const STATUS_OPTIONS = [
    { name: 'Online', value: 'online' },
    { name: 'Idle', value: 'idle' },
    { name: 'Do Not Disturb', value: 'dnd' },
    { name: 'Invisible', value: 'invisible' },
];

// ActivityType.Custom (nilai 4) tidak bisa di-set oleh bot, jadi kita filter
const ACTIVITY_TYPE_OPTIONS = Object.entries(ActivityType)
    .filter(([k, v]) => typeof v === 'number')
    .map(([k, v]) => ({ name: k, value: k }));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('presence')
        .setDescription('🔄 Change bot presence')
        .addStringOption((opt) =>
            opt
                .setName('status')
                .setDescription('Bot status (online, idle, dnd, invisible)')
                .setRequired(true)
                .addChoices(...STATUS_OPTIONS)
        )
        .addStringOption((opt) =>
            opt
                .setName('type')
                .setDescription('Activity type (Playing, Streaming, Listening, Watching, Competing)')
                .setRequired(true)
                .addChoices(...ACTIVITY_TYPE_OPTIONS)
        )
        .addStringOption((opt) => opt.setName('activity').setDescription('Activity name').setRequired(true))
        // TAMBAHKAN OPSI BARU UNTUK URL
        .addStringOption(
            (opt) => opt.setName('url').setDescription('Streaming URL (Twitch/YouTube), wajib untuk tipe Streaming').setRequired(false) // Opsional untuk tipe lain
        )
        .setContexts(InteractionContextType.BotDM),
    ownerOnly: true,
    async execute(interaction, container) {
        const { t } = container;

        await interaction.deferReply({ ephemeral: true });

        const status = interaction.options.getString('status');
        const type = interaction.options.getString('type');
        const activityName = interaction.options.getString('activity');
        const url = interaction.options.getString('url'); // Ambil URL

        const activityPayload = {
            name: activityName,
            type: ActivityType[type],
        };

        // LOGIKA SPESIAL UNTUK STREAMING
        if (activityPayload.type === ActivityType.Streaming) {
            // Validasi URL
            if (!url || (!url.startsWith('https://www.twitch.tv/') && !url.startsWith('https://www.youtube.com/'))) {
                return interaction.editReply({
                    content: await t(interaction, 'core.utils.presence.invalid.url'), // Buat terjemahan baru
                    ephemeral: true,
                });
            }
            activityPayload.url = url; // Tambahkan URL ke payload
        }

        try {
            await interaction.client.user.setPresence({
                activities: [activityPayload], // Gunakan payload yang sudah kita siapkan
                status: status,
            });

            return interaction.editReply({
                content: await t(interaction, 'core.utils.presence.success', {
                    type,
                    activity: activityName,
                    status,
                }),
            });
        } catch (err) {
            console.error(err);
            return interaction.editReply({
                content: await t(interaction, 'core.utils.presence.error'),
                ephemeral: true,
            });
        }
    },
};
