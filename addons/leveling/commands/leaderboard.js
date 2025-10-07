/**
 * @namespace: addons/leveling/commands/leaderboard.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */
const { EmbedBuilder } = require('discord.js');
const User = require('@coreModels/User');
const { embedFooter } = require('@utils/discord');
const { t } = require('@utils/translator');

module.exports = {
    subcommand: true,
    data: (subcommand) => subcommand.setName('leaderboard').setDescription("See the server's level leaderboard."),

    async execute(interaction) {
        await interaction.deferReply();

        const topUsers = await User.findAll({
            where: { guildId: interaction.guild.id },
            order: [
                ['level', 'DESC'],
                ['xp', 'DESC'],
            ],
            limit: 10,
        });

        let leaderboard;
        if (topUsers.length === 0) {
            leaderboard = await t(interaction, 'leveling_leaderboard_leveling_leaderboard_empty');
        } else {
            leaderboard = (
                await Promise.all(
                    topUsers.map(
                        async (user, index) =>
                            await t(interaction, 'leveling_leaderboard_leveling_leaderboard_entry', {
                                rank: index + 1,
                                userId: user.userId,
                                level: user.level || 0,
                                xp: user.xp || 0,
                            })
                    )
                )
            ).join('\n');
        }

        const embed = new EmbedBuilder()
            .setColor(kythia.bot.color)
            .setDescription(`## ${await t(interaction, 'leveling_leaderboard_leveling_leaderboard_title')}\n${leaderboard}`)
            .setTimestamp()
            .setFooter(await embedFooter(interaction));

        await interaction.editReply({ embeds: [embed] });
    },
};
