/**
 * @namespace: addons/leveling/commands/xp-set.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const User = require('@coreModels/User');
const { calculateLevelAndXp } = require('../helpers');
const { embedFooter } = require('@coreHelpers/discord');
const { t } = require('@coreHelpers/translator');

module.exports = {
    subcommand: true,
    permissions: [PermissionFlagsBits.ManageGuild],
    data: (subcommand) =>
        subcommand
            .setName('xp-set')
            .setDescription("Set a user's total XP to a specific value.")
            .addUserOption((option) => option.setName('user').setDescription('The user to set the XP for.').setRequired(true))
            .addIntegerOption((option) => option.setName('xp').setDescription('The total XP to set.').setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const targetUser = interaction.options.getUser('user');
        const xpToSet = interaction.options.getInteger('xp');
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

        const { newLevel, newXp } = calculateLevelAndXp(xpToSet);
        user.level = newLevel;
        user.xp = newXp;
        user.changed('xp', true);
        user.changed('level', true);
        await user.saveAndUpdateCache('userId');

        const embed = new EmbedBuilder()
            .setColor(kythia.bot.color)
            .setDescription(
                `## ${await t(interaction, 'leveling.xp-set.leveling.xp.set.title')}\n` +
                    (await t(interaction, 'leveling.xp-set.leveling.xp.set.desc', {
                        username: targetUser.username,
                        newLevel: user.level,
                        newXp: user.xp,
                    }))
            )
            .setTimestamp()
            .setFooter(await embedFooter(interaction));

        return interaction.editReply({ embeds: [embed] });
    },
};
