/**
 * @namespace: addons/adventure/commands/profile.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder } = require('discord.js');
const characters = require('../helpers/characters');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('profile')
            .setNameLocalizations({ id: 'profil', fr: 'profil', ja: 'プロフィール' })
            .setDescription('📑 Look at your Adventure stats')
            .setDescriptionLocalizations({
                id: '📑 Lihat Statistik petualanganmu',
                fr: "📑 Tes statistiques d'aventure",
                ja: '📑 冒険のステータスを確認しよう',
            }),
    async execute(interaction, container) {
        // Dependency
        const { t, models, kythiaConfig, helpers } = container;
        const { UserAdventure, InventoryAdventure } = models;
        const { embedFooter } = helpers.discord;

        await interaction.deferReply();
        const user = await UserAdventure.getCache({ userId: interaction.user.id });

        if (!user) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(await t(interaction, 'adventure.no.character'))
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const xpForNextLevel = 100 * user.level;
        const xpProgress = Math.min(user.xp / xpForNextLevel, 1);
        const progressBar = '█'.repeat(Math.round(20 * xpProgress)) + '░'.repeat(20 - Math.round(20 * xpProgress));

        const characterFields = [];
        if (user.characterId) {
            const c = characters.getChar(user.characterId);
            if (c) {
                const charTitle = await t(interaction, 'adventure.stats.character');
                characterFields.push({ name: charTitle, value: `${c.emoji} ${c.name}`, inline: false });
            }
        }

        const embed = new EmbedBuilder()
            .setColor(kythiaConfig.bot.color)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setDescription(await t(interaction, 'adventure.stats.embed.desc', { username: interaction.user.username }))
            .addFields(
                { name: await t(interaction, 'adventure.stats.level'), value: `**${user.level}**`, inline: true },
                { name: await t(interaction, 'adventure.stats.hp'), value: `**${user.hp}**`, inline: true },
                { name: '\u200B', value: '\u200B', inline: true },
                { name: await t(interaction, 'adventure.stats.gold'), value: `**${user.gold}**`, inline: true },
                { name: await t(interaction, 'adventure.stats.strength'), value: `**${user.strength}**`, inline: true },
                { name: '\u200B', value: '\u200B', inline: true },
                { name: await t(interaction, 'adventure.stats.defense'), value: `**${user.defense}**`, inline: true },
                {
                    name: await t(interaction, 'adventure.stats.xp.progress.text'),
                    value: await t(interaction, 'adventure.stats.xp.progress.value', { xp: user.xp, xpForNextLevel, progressBar }),
                    inline: false,
                },
                ...characterFields
            )
            .setFooter(await embedFooter(interaction));

        return interaction.editReply({ embeds: [embed] });
    },
};
