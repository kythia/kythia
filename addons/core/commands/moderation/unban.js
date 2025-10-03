/**
 * @namespace: addons/core/commands/moderation/unban.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */
const { SlashCommandBuilder, EmbedBuilder, InteractionContextType, PermissionFlagsBits } = require('discord.js');
const { embedFooter } = require('@utils/discord');
const { t } = require('@utils/translator');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('🔓 Unbans a user from the server.')
        .addStringOption((option) => option.setName('userid').setDescription('User ID to unban').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setContexts(InteractionContextType.Guild),
    permissions: PermissionFlagsBits.BanMembers,
    botPermissions: PermissionFlagsBits.BanMembers,
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const userId = interaction.options.getString('userid');

        try {
            await interaction.guild.members.unban(userId);
            const embed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setDescription(
                    `## ${await t(interaction, 'core_moderation_unban_embed_title')}\n` +
                        (await t(interaction, 'core_moderation_unban_embed_desc', { user: `<@${userId}>` }))
                )
                .setThumbnail(interaction.client.user.displayAvatarURL())
                .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        } catch (error) {
            return interaction.editReply({
                content: await t(interaction, 'core_moderation_unban_failed', { error: error.message }),
            });
        }
    },
};
