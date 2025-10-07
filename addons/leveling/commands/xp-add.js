/**
 * @namespace: addons/leveling/commands/xp-add.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const User = require('@coreModels/User');
const { calculateLevelAndXp, levelUpXp } = require('../helpers');
const { embedFooter } = require('@utils/discord');
const { t } = require('@utils/translator');

module.exports = {
    subcommand: true,
    permissions: [PermissionFlagsBits.ManageGuild],
    data: (subcommand) =>
        subcommand
            .setName('xp-add')
            .setDescription('Add XP to a user.')
            .addUserOption((option) => option.setName('user').setDescription('The user to add XP to.').setRequired(true))
            .addIntegerOption((option) => option.setName('xp').setDescription('The amount of XP to add.').setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const targetUser = interaction.options.getUser('user');
        const xpToAdd = interaction.options.getInteger('xp');
        const user = await User.getCache({ userId: targetUser.id, guildId: interaction.guild.id });

        if (!user) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(
                    `## ${await t(interaction, 'leveling_xp-set_leveling_user_not_found_title')}\n${await t(interaction, 'leveling_xp-set_leveling_user_not_found')}`
                )
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        let totalXp = user.xp;
        for (let i = 1; i < user.level; i++) {
            totalXp += levelUpXp(i);
        }
        totalXp += xpToAdd;

        const { newLevel, newXp } = calculateLevelAndXp(totalXp);

        user.level = newLevel;
        user.xp = newXp;
        user.changed('xp', true);
        user.changed('level', true);
        await user.saveAndUpdateCache('userId');

        const embed = new EmbedBuilder()
            .setColor(kythia.bot.color)
            .setDescription(
                `## ${await t(interaction, 'leveling_xp-add_leveling_xp_add_title')}\n` +
                    (await t(interaction, 'leveling_xp-add_leveling_xp_add_desc', {
                        username: targetUser.username,
                        xp: xpToAdd,
                        newLevel: user.level,
                        newXp: user.xp,
                    }))
            )
            .setTimestamp()
            .setFooter(await embedFooter(interaction));

        return interaction.editReply({ embeds: [embed] });
    },
};
