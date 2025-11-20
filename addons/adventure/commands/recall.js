/**
 * @namespace: addons/adventure/commands/recall.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder } = require('discord.js');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('recall')
            .setNameLocalizations({ id: 'kembali', fr: 'retour', ja: 'リコール' })
            .setDescription('🏙️ Get back to the city!')
            .setDescriptionLocalizations({ id: '🏙️ kembali ke kota', fr: '🏙️ Retourne en ville !', ja: '🏙️ 街へ戻ろう！' }),
    async execute(interaction, container) {
        // Dependency
        const { t, models, kythiaConfig, helpers } = container;
        const { UserAdventure, InventoryAdventure } = models;
        const { embedFooter } = helpers.discord;

        await interaction.deferReply();
        const user = await UserAdventure.getCache({ userId: interaction.user.id });

        if (!user) {
            const embed = new EmbedBuilder().setColor('Red').setDescription(await t(interaction, 'adventure.no.character'));
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
            .setDescription(await t(interaction, 'adventure.recall.recalled'))
            .setColor(kythiaConfig.bot.color)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter(await embedFooter(interaction));
        return interaction.editReply({ embeds: [embed] });
    },
};
