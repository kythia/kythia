/**
 * @namespace: addons/core/commands/moderation/fullsetup.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */

const logger = require('@src/utils/logger');
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags, InteractionContextType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('automod-setup')
        .setDescription('Installs/re-installs a set of 6 core AutoMod rules.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setContexts(InteractionContextType.Guild),
    permissions: PermissionFlagsBits.ManageGuild,
    botPermissions: PermissionFlagsBits.ManageGuild,

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const { guild, client } = interaction;
        const botId = client.user.id;
        const createdRules = [];
        const totalRules = 6; // Total aturan sekarang jadi 6

        // Helper: update status with embed
        const updateStatus = async (ruleName) => {
            createdRules.push(ruleName);
            const statusEmbed = new EmbedBuilder()
                .setColor('Yellow')
                .setTitle('⚙️ Proses Instalasi Aturan AutoMod')
                .setDescription(
                    `**Status:** Sedang menginstal aturan baru...\n` +
                        `**Selesai:** ${createdRules.length} / ${totalRules}\n` +
                        `**Terakhir dibuat:** \`${ruleName}\``
                )
                .addFields({
                    name: 'Aturan yang Sudah Dibuat',
                    value: createdRules.length > 0 ? createdRules.map((r) => `• ${r}`).join('\n') : 'Belum ada.',
                })
                .setFooter({ text: 'Kythia AutoMod System' });
            await interaction.editReply({ content: '', embeds: [statusEmbed] });
        };

        try {
            // ===== LANGKAH PEMBERSIHAN OTOMATIS =====
            const cleaningEmbed = new EmbedBuilder()
                .setColor('Blurple')
                .setTitle('🔍 Membersihkan Aturan Lama')
                .setDescription('Mencari dan membersihkan aturan lama buatan Kythia...');
            await interaction.editReply({ content: '', embeds: [cleaningEmbed] });

            const existingRules = await guild.autoModerationRules.fetch();
            const kythiaRules = existingRules.filter((rule) => rule.name.startsWith('[Kythia]'));

            if (kythiaRules.size > 0) {
                const foundEmbed = new EmbedBuilder()
                    .setColor('Orange')
                    .setTitle('🗑️ Menghapus Aturan Lama')
                    .setDescription(`Menemukan **${kythiaRules.size}** aturan lama. Menghapus...`);
                await interaction.editReply({ content: '', embeds: [foundEmbed] });

                for (const rule of kythiaRules.values()) {
                    await rule.delete('Re-installing Kythia AutoMod rules.');
                }
            }

            // 1. PRESETS GABUNGAN
            await guild.autoModerationRules.create({
                name: '[Kythia] Block Bad Words (Presets)',
                creatorId: botId,
                enabled: true,
                eventType: 1,
                triggerType: 4,
                triggerMetadata: { presets: [1, 2, 3] },
                actions: [{ type: 1 }],
            });
            await updateStatus('Block Bad Words (All Presets)');

            // 2. SPAM
            await guild.autoModerationRules.create({
                name: '[Kythia] Block Suspected Spam',
                creatorId: botId,
                enabled: true,
                eventType: 1,
                triggerType: 3,
                actions: [{ type: 1 }],
            });
            await updateStatus('Block Suspected Spam');

            // 3. MENTION SPAM GABUNGAN (USER & ROLE)
            await guild.autoModerationRules.create({
                name: '[Kythia] Block Mass Mentions (Users & Roles)',
                creatorId: botId,
                enabled: true,
                eventType: 1,
                triggerType: 5,
                triggerMetadata: {
                    mentionTotalLimit: 6, // Batas total mention (user + role)
                    mentionRaidedProtectionEnabled: true, // Aktifkan proteksi dari raid mention
                },
                actions: [{ type: 1 }],
            });
            await updateStatus('Block Mass Mentions (Combined)');

            // 4. INVITE LINK
            await guild.autoModerationRules.create({
                name: '[Kythia] Block Discord Invites',
                creatorId: botId,
                enabled: true,
                eventType: 1,
                triggerType: 1,
                triggerMetadata: { keywordFilter: ['discord.gg/', 'discord.com/invite/'] },
                actions: [{ type: 1 }],
            });
            await updateStatus('Block Discord Invites');

            // 5. SCAM LINK
            await guild.autoModerationRules.create({
                name: '[Kythia] Block Scam & Phishing Links',
                creatorId: botId,
                enabled: true,
                eventType: 1,
                triggerType: 1,
                triggerMetadata: {
                    keywordFilter: ['nitro for free', 'free steam', 'steamcommunily', 'disord.gift', '.ru/gift', '.xyz/gift'],
                },
                actions: [{ type: 1 }],
            });
            await updateStatus('Block Scam & Phishing Links');

            // 6. CAPS LOCK
            await guild.autoModerationRules.create({
                name: '[Kythia] Block Excessive Caps',
                creatorId: botId,
                enabled: true,
                eventType: 1,
                triggerType: 1,
                triggerMetadata: { regexPatterns: ['[A-Z0-9\\s]{30,}'] },
                actions: [{ type: 1 }],
            });
            await updateStatus('Block Excessive Caps');

            // SELESAI
            const successEmbed = new EmbedBuilder()
                .setColor('Green')
                .setTitle(`✅ Instalasi ${totalRules} Aturan AutoMod Selesai!`)
                .setDescription(`**${totalRules} aturan AutoMod** telah berhasil diinstal ulang. Servermu sekarang bersih dan aman!`)
                .addFields({ name: 'Aturan yang Terpasang', value: createdRules.map((r) => `• ${r}`).join('\n') })
                .setFooter({ text: 'Kythia AutoMod System' });

            await interaction.editReply({ content: '', embeds: [successEmbed] });
        } catch (error) {
            logger.error('Error during AutoMod setup:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('❌ Gagal Total!')
                .setDescription(
                    "Terjadi kesalahan saat setup. Pastikan aku memiliki izin **'Manage Server'**.\n\nCoba jalankan command ini lagi."
                )
                .addFields({
                    name: 'Aturan yang Berhasil Dibuat',
                    value: createdRules.length > 0 ? createdRules.map((r) => `• ${r}`).join('\n') : 'Tidak ada, semua sudah dibersihkan.',
                })
                .setFooter({ text: 'Kythia AutoMod System' });

            await interaction.editReply({ content: '', embeds: [errorEmbed] });
        }
    },
};
