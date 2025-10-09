/**
 * @namespace: addons/adventure/commands/stats.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */
const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../database/models/UserAdventure');
const { embedFooter } = require('@utils/discord');
const { t } = require('@utils/translator');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('stats')
            .setNameLocalizations({ id: 'statistik', fr: 'statistiques', ja: 'ステータス' })
            .setDescription('📑 Look at your Adventure stats')
            .setDescriptionLocalizations({
                id: '📑 Lihat Statistik petualanganmu',
                fr: "📑 Tes statistiques d'aventure",
                ja: '📑 冒険のステータスを確認しよう',
            }),
    guildOnly: true,
    async execute(interaction) {
        await interaction.deferReply();
        const user = await User.getCache({ userId: interaction.user.id, guildId: interaction.guild.id });

        if (!user) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(await t(interaction, 'adventure_no_character'))
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const xpForNextLevel = 100 * user.level;
        const xpProgress = Math.min(user.xp / xpForNextLevel, 1);
        const progressBar = '█'.repeat(Math.round(20 * xpProgress)) + '░'.repeat(20 - Math.round(20 * xpProgress));

        const embed = new EmbedBuilder()
            .setColor(kythia.bot.color)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setDescription(await t(interaction, 'adventure_stats_embed_desc', { username: interaction.user.username }))
            .addFields(
                { name: await t(interaction, 'adventure_stats_level'), value: `**${user.level}**`, inline: true },
                { name: await t(interaction, 'adventure_stats_hp'), value: `**${user.hp}**`, inline: true },
                { name: '\u200B', value: '\u200B', inline: true },
                { name: await t(interaction, 'adventure_stats_gold'), value: `**${user.gold}**`, inline: true },
                { name: await t(interaction, 'adventure_stats_strength'), value: `**${user.strength}**`, inline: true },
                { name: '\u200B', value: '\u200B', inline: true },
                { name: await t(interaction, 'adventure_stats_defense'), value: `**${user.defense}**`, inline: true },
                {
                    name: await t(interaction, 'adventure_stats_xp_progress'),
                    value: await t(interaction, 'adventure_stats_xp_progress_value', { xp: user.xp, xpForNextLevel, progressBar }),
                    inline: false,
                }
            )
            .setFooter(await embedFooter(interaction));

        return interaction.editReply({ embeds: [embed] });
    },
};
