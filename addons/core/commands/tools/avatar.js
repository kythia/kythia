/**
 * @namespace: addons/core/commands/tools/avatar.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { SlashCommandBuilder, EmbedBuilder, ApplicationCommandType, ContextMenuCommandBuilder } = require('discord.js');

module.exports = {
    slashCommand: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('🖼️ Show user avatar.')
        .addUserOption((option) => option.setName('user').setDescription('The user whose avatar you want to see.').setRequired(false)),

    contextMenuCommand: new ContextMenuCommandBuilder().setName('User Avatar').setType(ApplicationCommandType.User),

    contextMenuDescription: '🖼️ Show user avatar.',
    async execute(interaction, container) {
        const { t, kythiaConfig, helpers } = container;
        const { embedFooter } = helpers.discord;

        const user = interaction.options.getUser('user') || interaction.targetUser || interaction.user;

        const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });

        const embed = new EmbedBuilder()
            .setColor(kythiaConfig.bot.color)
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
            .setDescription(await t(interaction, 'core.tools.avatar.embed.desc', { url: avatarURL }))
            .setImage(avatarURL)
            .setFooter(await embedFooter(interaction))
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
