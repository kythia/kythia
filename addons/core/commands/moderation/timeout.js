/**
 * @namespace: addons/core/commands/moderation/timeout.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, InteractionContextType } = require('discord.js');
const { embedFooter } = require('@utils/discord');
const { t } = require('@utils/translator');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('⏰ Puts a user in timeout for a specified duration.')
        .addUserOption((option) => option.setName('user').setDescription('User to timeout').setRequired(true))
        .addIntegerOption((option) => option.setName('duration').setDescription('Duration in seconds').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setContexts(InteractionContextType.Guild),
    permissions: PermissionFlagsBits.ModerateMembers,
    botPermissions: PermissionFlagsBits.ModerateMembers,
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser('user');
        const duration = interaction.options.getInteger('duration') * 1000;

        let member;
        try {
            member = await interaction.guild.members.fetch(user.id);
        } catch (e) {
            member = null;
        }

        if (member) {
            try {
                await member.timeout(duration, await t(interaction, 'core_moderation_timeout_reason'));
                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(
                        `## ${await t(interaction, 'core_moderation_timeout_embed_title')}\n` +
                            (await t(interaction, 'core_moderation_timeout_embed_desc', {
                                user: `<@${user.id}>`,
                                duration: duration / 1000,
                                moderator: `<@${interaction.user.id}>`,
                            }))
                    )
                    .setThumbnail(interaction.client.user.displayAvatarURL())
                    .setTimestamp()
                    .setFooter(await embedFooter(interaction));
                return interaction.editReply({ embeds: [embed] });
            } catch (error) {
                console.error('Error during timeout:', error);
                return interaction.editReply({
                    content: await t(interaction, 'core_moderation_timeout_failed', { error: error.message }),
                });
            }
        } else {
            return interaction.editReply({
                content: await t(interaction, 'core_moderation_timeout_user_not_found'),
            });
        }
    },
};
