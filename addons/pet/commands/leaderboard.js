/**
 * @namespace: addons/pet/commands/leaderboard.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const UserPet = require('../database/models/UserPet');
const Pet = require('../database/models/Pet');
const { embedFooter } = require('@coreHelpers/discord');
const { EmbedBuilder } = require('discord.js');
const { t } = require('@coreHelpers/translator');

module.exports = {
    subcommand: true,
    data: (subcommand) => subcommand.setName('leaderboard').setDescription('View pet leaderboard!'),
    async execute(interaction) {
        await interaction.deferReply();

        const leaderboard = await UserPet.getAllCache({
            include: [{ model: Pet, as: 'pet' }],
            order: [
                [
                    UserPet.sequelize.literal(
                        'CASE WHEN pet.rarity = "common" THEN 1 WHEN pet.rarity = "rare" THEN 2 WHEN pet.rarity = "epic" THEN 3 WHEN pet.rarity = "legendary" THEN 4 END'
                    ),
                    'DESC',
                ],
                ['level', 'DESC'],
            ],
            cacheTags: ['UserPet:leaderboard'],
        });

        let leaderboardDesc;
        if (leaderboard.length) {
            // Await all translations before joining
            const entries = await Promise.all(
                leaderboard.map((pet, index) =>
                    t(interaction, 'pet.leaderboard.entry', {
                        index: index + 1,
                        userId: pet.userId,
                        username: interaction.client.users.cache.get(pet.userId)?.username || 'Unknown',
                        icon: pet.pet.icon,
                        rarity: pet.pet.rarity,
                        name: pet.pet.name,
                        level: pet.level,
                    })
                )
            );
            leaderboardDesc = entries.join('\n');
        } else {
            leaderboardDesc = await t(interaction, 'pet.leaderboard.empty');
        }

        const embed = new EmbedBuilder()
            .setDescription(`${await t(interaction, 'pet.leaderboard.title')}\n${leaderboardDesc}`)
            .setColor(kythia.bot.color)
            .setFooter(await embedFooter(interaction))
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    },
};
