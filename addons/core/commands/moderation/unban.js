/**
 * @namespace: addons/core/commands/moderation/unban.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: (subcommand) =>
        subcommand
            .setName('unban')
            .setDescription('🔓 Unbans a user from the server.')
            .addStringOption((option) => option.setName('userid').setDescription('User ID to unban').setRequired(true)),
    permissions: PermissionFlagsBits.BanMembers,
    botPermissions: PermissionFlagsBits.BanMembers,
    async execute(interaction, container) {
        const { t, helpers } = container;
        const { embedFooter } = helpers.discord;

        await interaction.deferReply({ ephemeral: true });
        const userId = interaction.options.getString('userid');

        try {
            await interaction.guild.members.unban(userId);
            const embed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setDescription(
                    `## ${await t(interaction, 'core.moderation.unban.embed.title')}\n` +
                        (await t(interaction, 'core.moderation.unban.embed.desc', { user: `<@${userId}>` }))
                )
                .setThumbnail(interaction.client.user.displayAvatarURL())
                .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        } catch (error) {
            return interaction.editReply({
                content: await t(interaction, 'core.moderation.unban.failed', { error: error.message }),
            });
        }
    },
};
