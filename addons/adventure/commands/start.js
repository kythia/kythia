/**
 * @namespace: addons/adventure/commands/start.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder } = require('discord.js');
const characters = require('../helpers/characters');

module.exports = {
    subcommand: true,
    data: (subcommand) => {
        const chars = characters.getAllCharacters();
        return subcommand
            .setName('start')
            .setNameLocalizations({ id: 'mulai', fr: 'demarrer', ja: 'スタート' })
            .setDescription('🛩️ Start your journey now!')
            .setDescriptionLocalizations({
                id: '🛩️ Mulai petualanganmu sekarang!',
                fr: '🛩️ Commence ton aventure maintenant !',
                ja: '🛩️ 今すぐ冒険を始めよう！',
            })
            .addStringOption((option) =>
                option
                    .setName('character')
                    .setDescription('Choose your starting character!')
                    .setRequired(true)
                    .addChoices(
                        ...chars.map((char) => ({
                            name: `${char.emoji} ${char.name}`,
                            value: char.id,
                        }))
                    )
            );
    },
    async execute(interaction, container) {
        // Dependency
        const { t, models, kythiaConfig, helpers } = container;
        const { UserAdventure, InventoryAdventure } = models;
        const { embedFooter } = helpers.discord;

        await interaction.deferReply();

        const existing = await UserAdventure.getCache({ userId: interaction.user.id });

        if (existing) {
            const alreadyEmbed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setDescription(await t(interaction, 'adventure.start.already.have'))
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [alreadyEmbed] });
        }

        const charId = interaction.options.getString('character');
        const selected = characters.getChar(charId);
        if (!selected) {
            const embed = new EmbedBuilder().setColor('Red').setDescription('Invalid character selection. Please try again.');
            return interaction.editReply({ embeds: [embed] });
        }

        let level = 1;
        let xp = 0;
        let baseHp = 100;
        let gold = 50;
        let strength = 10;
        let defense = 5;

        strength += selected.strengthBonus;
        defense += selected.defenseBonus;
        baseHp = Math.floor(baseHp * (1 + (selected.hpBonusPercent || 0) / 100));

        await UserAdventure.create({
            userId: interaction.user.id,
            level,
            xp,
            hp: baseHp,
            maxHp: baseHp,
            gold,
            strength,
            defense,
            characterId: selected.id,
        });

        const charStatsString = await t(interaction, 'adventure.start.choose.char.stats', {
            str: `${strength - selected.strengthBonus} (${selected.strengthBonus >= 0 ? '+' : ''}${selected.strengthBonus})`,
            def: `${defense - selected.defenseBonus} (${selected.defenseBonus >= 0 ? '+' : ''}${selected.defenseBonus})`,
            hp: `100% (${selected.hpBonusPercent >= 0 ? '+' : ''}${selected.hpBonusPercent}%)`,
            xp: `0% (${selected.xpBonusPercent >= 0 ? '+' : ''}${selected.xpBonusPercent}%)`,
            gold: `0% (${selected.goldBonusPercent >= 0 ? '+' : ''}${selected.goldBonusPercent}%)`,
        });

        const embed = new EmbedBuilder()
            .setColor(kythiaConfig.bot.color)
            .setTitle(await t(interaction, 'adventure.start.success.title'))
            .setDescription(
                [
                    await t(interaction, 'adventure.start.success.desc'),
                    '',
                    `**${await t(interaction, 'adventure.start.selected.char')}**`,
                    `${selected.emoji} ${selected.name}`,
                    selected.description,
                    charStatsString,
                ].join('\n')
            )
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter(await embedFooter(interaction));
        return interaction.editReply({ embeds: [embed] });
    },
};
