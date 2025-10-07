/**
 * @namespace: addons/adventure/commands/recall.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */
const { EmbedBuilder } = require('discord.js');
const User = require('../database/models/UserAdventure');
const { embedFooter } = require('@utils/discord');
const { t } = require('@src/utils/translator');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('recall')
            .setNameLocalizations({ id: 'kembali', fr: 'retour', ja: 'リコール' })
            .setDescription('🏙️ Get back to the city!')
            .setDescriptionLocalizations({ id: '🏙️ kembali ke kota', fr: '🏙️ Retourne en ville !', ja: '🏙️ 街へ戻ろう！' }),
    guildOnly: true,
    async execute(interaction) {
        await interaction.deferReply();
        const user = await User.getCache({ userId: interaction.user.id, guildId: interaction.guild.id });

        if (!user) {
            const embed = new EmbedBuilder().setColor('Red').setDescription(await t(interaction, 'adventure_no_character'));
            return interaction.editReply({ embeds: [embed] });
        }

        user.hp = Math.floor(100 * (1 + user.level * 0.1));
        user.monsterName = null;
        user.monsterHp = 0;
        user.monsterStrength = 0;
        user.monsterGoldDrop = 0;
        user.monsterXpDrop = 0;
        await user.saveAndUpdateCache();
        const embed = new EmbedBuilder()
            .setDescription(await t(interaction, 'adventure_recall_recalled'))
            .setColor(kythia.bot.color)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter(await embedFooter(interaction));
        return interaction.editReply({ embeds: [embed] });
    },
};
