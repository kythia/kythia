/**
 * @namespace: addons/core/commands/moderation/ban.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, InteractionContextType } = require('discord.js');
const { embedFooter } = require('@utils/discord');
const { t } = require('@utils/translator');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('⚠️ Ban a user from the server.')
        .addUserOption((option) => option.setName('user').setDescription('User to ban').setRequired(true))
        .addStringOption((option) => option.setName('reason').setDescription('Reason for ban (optional)').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setContexts(InteractionContextType.Guild),
    permissions: PermissionFlagsBits.BanMembers,
    botPermissions: PermissionFlagsBits.BanMembers,
    async execute(interaction) {
        await interaction.deferReply();

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || (await t(interaction, 'core_moderation_ban_default_reason'));

        let member;
        try {
            member = await interaction.guild.members.fetch(user.id);
        } catch (e) {
            member = null;
        }

        // Prevent self-ban
        if (user.id === interaction.user.id) {
            return interaction.editReply({
                content: await t(interaction, 'core_moderation_ban_cannot_self'),
                ephemeral: true,
            });
        }

        if (member) {
            await member.ban({ reason });
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle(await t(interaction, 'core_moderation_ban_embed_title'))
                .setDescription(
                    await t(interaction, 'core_moderation_ban_embed_desc', {
                        tag: user.tag,
                        reason,
                    })
                )
                .setThumbnail(interaction.client.user.displayAvatarURL())
                .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        } else {
            return interaction.editReply({
                content: await t(interaction, 'core_moderation_ban_user_not_found'),
            });
        }
    },
};
