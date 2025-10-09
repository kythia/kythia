/**
 * @namespace: addons/core/commands/moderation/kick.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, InteractionContextType } = require('discord.js');
const { embedFooter } = require('@utils/discord');
const { t } = require('@utils/translator');
const ServerSetting = require('@coreModels/ServerSetting');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('⚠️ Kick a user from the server.')
        .addUserOption((option) => option.setName('user').setDescription('User to kick').setRequired(true))
        .addStringOption((option) => option.setName('reason').setDescription('Reason for kick (optional)').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setContexts(InteractionContextType.Guild),
    permissions: PermissionFlagsBits.KickMembers,
    botPermissions: PermissionFlagsBits.KickMembers,
    async execute(interaction) {
        await interaction.deferReply();
        const setting = ServerSetting.getCache({ guildId: interaction.guild.id });
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || (await t(interaction, 'core_moderation_kick_default_reason'));

        // Prevent self-kick
        if (user.id === interaction.user.id) {
            return interaction.editReply({
                content: await t(interaction, 'core_moderation_kick_cannot_self'),
                ephemeral: true,
            });
        }

        let member;
        try {
            member = await interaction.guild.members.fetch(user.id);
        } catch (e) {
            member = null;
        }

        if (member) {
            await member.kick(reason);
            if (setting.modLogChannelId) {
                const modLogChannel = interaction.guild.channels.cache.get(setting.modLogChannelId);
                if (modLogChannel) {
                    const modLogEmbed = new EmbedBuilder()
                        .setColor('Red')
                        .setTitle(await t(interaction, 'core_moderation_kick_modlog_title'))
                        .setDescription(
                            await t(interaction, 'core_moderation_kick_modlog_desc', {
                                member: user.tag,
                                kicker: interaction.user.tag,
                                reason,
                            })
                        )
                        .setThumbnail(user.displayAvatarURL())
                        .setTimestamp()
                        .setFooter(await embedFooter(interaction));

                    modLogChannel.send({ embeds: [modLogEmbed] });
                }
            }
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle(await t(interaction, 'core_moderation_kick_embed_title'))
                .setDescription(
                    await t(interaction, 'core_moderation_kick_embed_desc', {
                        member: user.tag,
                        kicker: interaction.user.tag,
                        reason,
                    })
                )
                .setThumbnail(interaction.client.user.displayAvatarURL())
                .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        } else {
            return interaction.editReply({
                content: await t(interaction, 'core_moderation_kick_user_not_found'),
                ephemeral: true,
            });
        }
    },
};
