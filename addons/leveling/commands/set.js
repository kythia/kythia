/**
 * @namespace: addons/leveling/commands/set.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const User = require('@coreModels/User');
const { embedFooter } = require('@coreHelpers/discord');
const { t } = require('@coreHelpers/translator');

module.exports = {
    subcommand: true,
    permissions: [PermissionFlagsBits.ManageGuild],
    data: (subcommand) =>
        subcommand
            .setName('set')
            .setDescription("Set a user's level to a specific value.")
            .addUserOption((option) => option.setName('user').setDescription('The user to set the level for.').setRequired(true))
            .addIntegerOption((option) => option.setName('level').setDescription('The level to set.').setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const targetUser = interaction.options.getUser('user');
        const levelToSet = interaction.options.getInteger('level');
        const user = await User.getCache({ userId: targetUser.id, guildId: interaction.guild.id });

        if (!user) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(
                    `## ${await t(interaction, 'leveling.xp-set.leveling.user.not.found.title')}\n${await t(interaction, 'leveling.xp-set.leveling.user.not.found.desc')}`
                )
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        user.level = levelToSet;
        user.xp = 0;
        user.changed('level', true);
        user.changed('xp', true);
        await user.saveAndUpdateCache('userId');

        const embed = new EmbedBuilder()
            .setColor(kythia.bot.color)
            .setDescription(
                `## ${await t(interaction, 'leveling.set.leveling.set.title')}\n` +
                    (await t(interaction, 'leveling.set.leveling.set.desc', {
                        username: targetUser.username,
                        newLevel: user.level,
                    }))
            )
            .setTimestamp()
            .setFooter(await embedFooter(interaction));

        return interaction.editReply({ embeds: [embed] });
    },
};
