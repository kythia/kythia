/**
 * @namespace: addons/leveling/commands/profile.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder } = require('discord.js');
const User = require('@coreModels/User');
const { generateLevelImage, levelUpXp } = require('../helpers');
const { embedFooter } = require('@coreHelpers/discord');
const { t } = require('@coreHelpers/translator');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('profile')
            .setDescription("Check your or another user's level profile.")
            .addUserOption((option) => option.setName('user').setDescription('The user whose profile you want to see.')),

    async execute(interaction) {
        await interaction.deferReply();
        const targetUser = interaction.options.getUser('user') || interaction.user;
        let user = await User.getCache({ userId: targetUser.id, guildId: interaction.guild.id });

        if (!user) {
            user = await User.create({ userId: targetUser.id, guildId: interaction.guild.id });
            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setDescription(
                    `## ${await t(interaction, 'leveling.profile.leveling.profile.created.title')}\n${await t(interaction, 'leveling.profile.leveling.profile.created.desc')}`
                )
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const buffer = await generateLevelImage({
            username: targetUser.username,
            avatarURL: targetUser.displayAvatarURL({ extension: 'png', size: 256 }),
            level: user.level,
            xp: user.xp,
            nextLevelXp: levelUpXp(user.level),
            backgroundURL: 'https://files.catbox.moe/3pujs4.png',
        });

        const embed = new EmbedBuilder()
            .setColor(kythia.bot.color)
            .setDescription(
                `## ${await t(interaction, 'leveling.profile.leveling.profile.title')}\n` +
                    (await t(interaction, 'leveling.profile.leveling.profile.desc', {
                        username: targetUser.username,
                        level: user.level || 0,
                        xp: user.xp || 0,
                        nextLevelXp: levelUpXp(user.level),
                    }))
            )
            .setThumbnail(targetUser.displayAvatarURL())
            .setImage('attachment://level-profile.png')
            .setFooter(await embedFooter(interaction));

        await interaction.editReply({ embeds: [embed], files: [{ attachment: buffer, name: 'level-profile.png' }] });
    },
};
