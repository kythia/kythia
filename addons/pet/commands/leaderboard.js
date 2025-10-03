/**
 * @namespace: addons/pet/commands/leaderboard.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */
const { EmbedBuilder } = require('discord.js');
const { UserPet, Pet } = require('../database/models');
const { t } = require('@utils/translator');
const User = require('@coreModels/User');

module.exports = {
    subcommand: true,
    data: (subcommand) => subcommand.setName('leaderboard').setDescription('View pet leaderboard!'),
    async execute(interaction) {
        await interaction.deferReply();

        const leaderboard = await UserPet.findAll({
            include: { model: Pet, as: 'pet' },
            order: [
                [
                    User.sequelize.literal(
                        'CASE WHEN pet.rarity = "common" THEN 1 WHEN pet.rarity = "rare" THEN 2 WHEN pet.rarity = "epic" THEN 3 WHEN pet.rarity = "legendary" THEN 4 END'
                    ),
                    'DESC',
                ],
                ['level', 'DESC'],
            ],
        });

        let leaderboardDesc;
        if (leaderboard.length) {
            // Await all translations before joining
            const entries = await Promise.all(
                leaderboard.map((pet, index) =>
                    t(interaction, 'pet_leaderboard_entry', {
                        index: index + 1,
                        userId: pet.userId,
                        icon: pet.pet.icon,
                        rarity: pet.pet.rarity,
                        name: pet.pet.name,
                        level: pet.level,
                    })
                )
            );
            leaderboardDesc = entries.join('\n');
        } else {
            leaderboardDesc = await t(interaction, 'pet_leaderboard_empty');
        }

        const embed = new EmbedBuilder()
            .setDescription(
                `## ${await t(interaction, 'pet_leaderboard_title')}\n${leaderboardDesc}`
            )
            .setColor(kythia.bot.color)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter({
                text: await t(interaction, 'pet_leaderboard_footer'),
                iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }),
            })
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    },
};
