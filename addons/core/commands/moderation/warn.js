/**
 * @namespace: addons/core/commands/moderation/warn.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, InteractionContextType } = require('discord.js');
const User = require('@coreModels/User');
const ServerSetting = require('@coreModels/ServerSetting');
const { embedFooter } = require('@utils/discord');
const { t } = require('@utils/translator');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('⚠️ Warn a user.')
        .addUserOption((option) => option.setName('user').setDescription('User to warn').setRequired(true))
        .addStringOption((option) => option.setName('reason').setDescription('Reason for the warning').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setContexts(InteractionContextType.Guild),

    permissions: PermissionFlagsBits.ModerateMembers,
    botPermissions: PermissionFlagsBits.ModerateMembers,
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const setting = await ServerSetting.getCache({ guildId: interaction.guild.id });
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');

        let member;
        try {
            member = await interaction.guild.members.fetch(targetUser.id);
        } catch (err) {
            member = null;
        }
        if (!member) {
            return interaction.editReply({
                content: await t(interaction, 'core_moderation_warn_user_not_in_guild'),
            });
        }

        const userRecord = await User.getCache({ userId: targetUser.id, guildId: interaction.guild.id });
        if (!userRecord) {
            return interaction.editReply({
                content: await t(interaction, 'core_moderation_warn_user_not_in_db'),
            });
        }

        if (!Array.isArray(userRecord.warnings)) {
            userRecord.warnings = [];
        }
        userRecord.warnings.push({ reason, date: new Date() });

        try {
            userRecord.changed('warnings', true);
            await userRecord.saveAndUpdateCache('userId');
        } catch (err) {
            console.error('Error while saving user record:', err);
            return interaction.editReply({
                content: await t(interaction, 'core_moderation_warn_db_save_failed'),
            });
        }

        // If user has 3 or more warnings, timeout for 1 day
        let timeoutApplied = false;
        if (userRecord.warnings.length >= 3) {
            if (member.moderatable && member.permissions.has('SEND_MESSAGES')) {
                try {
                    await member.timeout(86400000, await t(interaction, 'core_moderation_warn_timeout_reason'));
                    timeoutApplied = true;
                } catch (err) {
                    console.warn('Failed to timeout member after 3 warnings:', err.message);
                }
            } else {
                console.warn('Bot does not have MODERATE_MEMBERS permission to timeout member.');
            }
        }

        if (setting && setting.modLogChannelId) {
            const modLogChannel = interaction.guild.channels.cache.get(setting.modLogChannelId);

            if (!modLogChannel) {
                return interaction.editReply({
                    content: await t(interaction, 'core_moderation_warn_modlog_not_found'),
                });
            }

            if (!modLogChannel.permissionsFor(interaction.client.user).has('SEND_MESSAGES')) {
                return interaction.editReply({
                    content: await t(interaction, 'core_moderation_warn_modlog_no_permission'),
                });
            }

            try {
                const channelEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(
                        await t(interaction, 'core_moderation_warn_modlog_embed', {
                            user: `<@${targetUser.id}>`,
                            moderator: `<@${interaction.user.id}>`,
                            reason,
                        })
                    )
                    .setTimestamp()
                    .setFooter(await embedFooter(interaction));

                await modLogChannel.send({ embeds: [channelEmbed] });

                if (timeoutApplied) {
                    const timeoutEmbed = new EmbedBuilder()
                        .setColor(kythia.bot.color)
                        .setDescription(
                            await t(interaction, 'core_moderation_warn_modlog_timeout_embed', {
                                user: `<@${targetUser.id}>`,
                            })
                        )
                        .setTimestamp()
                        .setFooter(await embedFooter(interaction));
                    await modLogChannel.send({ embeds: [timeoutEmbed] });
                }
            } catch (err) {
                console.warn('Failed to send log to modLogChannel:', err.message);
            }
        }

        const embed = new EmbedBuilder()
            .setColor(kythia.bot.color)
            .setDescription(
                await t(interaction, 'core_moderation_warn_success_embed', {
                    user: `<@${targetUser.id}>`,
                    reason,
                    timeout: timeoutApplied ? `\n\n${await t(interaction, 'core_moderation_warn_timeout_notice')}` : '',
                })
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter(await embedFooter(interaction));

        const warnEmbed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(
                await t(interaction, 'core_moderation_warn_dm_embed', {
                    user: `<@${targetUser.id}>`,
                    moderator: `<@${interaction.user.id}>`,
                    reason,
                    timeout: timeoutApplied ? `\n\n${await t(interaction, 'core_moderation_warn_dm_timeout_notice')}` : '',
                })
            )
            .setTimestamp()
            .setFooter(await embedFooter(interaction));

        try {
            await targetUser.send({ embeds: [warnEmbed] });
        } catch (err) {
            // DM failed, ignore or log if needed
        }

        return interaction.editReply({ embeds: [embed] });
    },
};
