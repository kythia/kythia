/**
 * @namespace: addons/core/commands/moderation/check.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */

const { SlashCommandBuilder, EmbedBuilder, MessageFlags, PermissionFlagsBits, InteractionContextType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('check')
        .setDescription('🔍 Check how many automod rules Kythia has created')
        .setContexts(InteractionContextType.BotDM),
    ownerOnly: true,
    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const botId = interaction.client.user.id;
        let totalRules = 0;
        const guildContributions = []; // Untuk menyimpan server mana aja yang nyumbang rules

        // Ambil semua server tempat bot join
        const guilds = interaction.client.guilds.cache;
        await interaction.editReply(`🔍 Memulai pengecekan di ${guilds.size} server...`);

        for (const guild of guilds.values()) {
            try {
                // Ambil semua aturan di server tersebut
                const rules = await guild.autoModerationRules.fetch();
                // Filter hanya aturan yang dibuat oleh Kythia
                const kythiaRules = rules.filter((rule) => rule.creatorId === botId);

                if (kythiaRules.size > 0) {
                    totalRules += kythiaRules.size;
                    guildContributions.push({ name: guild.name, count: kythiaRules.size });
                }
            } catch (err) {
                // Abaikan server di mana bot tidak punya izin, jangan sampai bikin command-nya crash
                // console.warn(`Tidak bisa fetch AutoMod di server: ${guild.name}`);
                continue;
            }
        }

        // -- Membuat Tampilan Hasil --
        const goal = 100;
        const percentage = Math.min(100, (totalRules / goal) * 100);
        const progressBar = '█'.repeat(Math.floor(percentage / 10)) + '░'.repeat(10 - Math.floor(percentage / 10));

        // Urutkan server berdasarkan kontribusi terbanyak
        guildContributions.sort((a, b) => b.count - a.count);
        const top5Guilds = guildContributions
            .slice(0, 5)
            .map((g) => `• **${g.count} rules** di *${g.name}*`)
            .join('\n');

        const embed = new EmbedBuilder()
            .setTitle('📊 Statistik Aturan AutoMod Kythia')
            .setColor(percentage >= 100 ? 'Green' : 'Orange')
            .setDescription(`Saat ini, Kythia telah membuat total **${totalRules}** aturan AutoMod di semua server.`)
            .addFields(
                {
                    name: `Progress Menuju Badge (${goal} Rules)`,
                    value: `\`${progressBar}\`\n**${percentage.toFixed(1)}%** tercapai.`,
                },
                {
                    name: '🏆 Top 5 Server Kontributor',
                    value: top5Guilds.length > 0 ? top5Guilds : 'Belum ada aturan yang dibuat.',
                }
            )
            .setFooter({ text: 'Statistik ini mungkin butuh beberapa saat untuk sinkron dengan Discord.' })
            .setTimestamp();

        if (percentage >= 100) {
            embed.addFields({
                name: '🎉 Selamat!',
                value: 'Target 100 aturan sudah terlampaui! Badge seharusnya akan muncul dalam 24 jam.',
            });
        }

        await interaction.editReply({ content: '', embeds: [embed] });
    },
};
