/**
 * @namespace: addons/core/commands/moderation/mute.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, InteractionContextType } = require('discord.js');
const { embedFooter } = require('@utils/discord');
const { t } = require('@utils/translator');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('🔇 Mute a user in a voice channel.')
        .addUserOption((option) => option.setName('user').setDescription('User to mute').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
        .setContexts(InteractionContextType.Guild),
    permissions: PermissionFlagsBits.MuteMembers,
    botPermissions: PermissionFlagsBits.MuteMembers,
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser('user');
        let member;
        try {
            member = await interaction.guild.members.fetch(user.id);
        } catch (e) {
            member = null;
        }

        if (!member) {
            return interaction.editReply({
                content: await t(interaction, 'core_moderation_mute_user_not_found'),
            });
        }

        if (!member.voice.channel) {
            return interaction.editReply({
                content: await t(interaction, 'core_moderation_mute_user_not_in_voice'),
            });
        }

        try {
            await member.voice.setMute(true, await t(interaction, 'core_moderation_mute_reason'));
        } catch (e) {
            return interaction.editReply({
                content: await t(interaction, 'core_moderation_mute_failed'),
            });
        }

        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(
                await t(interaction, 'core_moderation_mute_embed_desc', {
                    tag: user.tag,
                    moderator: interaction.user.tag,
                })
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter(await embedFooter(interaction));

        return interaction.editReply({ embeds: [embed] });
    },
};
