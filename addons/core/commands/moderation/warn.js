/**
 * @namespace: addons/core/commands/moderation/warn.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: (subcommand) =>
        subcommand
            .setName('warn')
            .setDescription('⚠️ Warn a user.')
            .addUserOption((option) => option.setName('user').setDescription('User to warn').setRequired(true))
            .addStringOption((option) => option.setName('reason').setDescription('Reason for the warning').setRequired(true)),

    permissions: PermissionFlagsBits.ModerateMembers,
    botPermissions: PermissionFlagsBits.ModerateMembers,
    async execute(interaction, container) {
        const { t, helpers, models, logger } = container;
        const { embedFooter } = helpers.discord;
        const { User, ServerSetting } = models;
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
                content: await t(interaction, 'core.moderation.warn.user.not.in.guild'),
            });
        }

        const userRecord = await User.getCache({ userId: targetUser.id, guildId: interaction.guild.id });
        if (!userRecord) {
            return interaction.editReply({
                content: await t(interaction, 'core.moderation.warn.user.not.in.db'),
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
            logger.error('Error while saving user record:', err);
            return interaction.editReply({
                content: await t(interaction, 'core.moderation.warn.db.save.failed'),
            });
        }

        // If user has 3 or more warnings, timeout for 1 day
        let timeoutApplied = false;
        if (userRecord.warnings.length >= 3) {
            if (member.moderatable && member.permissions.has('SEND_MESSAGES')) {
                try {
                    await member.timeout(86400000, await t(interaction, 'core.moderation.warn.timeout.reason'));
                    timeoutApplied = true;
                } catch (err) {
                    logger.warn('Failed to timeout member after 3 warnings:', err.message);
                }
            } else {
                logger.warn('Bot does not have MODERATE_MEMBERS permission to timeout member.');
            }
        }

        if (setting && setting.modLogChannelId) {
            const modLogChannel = interaction.guild.channels.cache.get(setting.modLogChannelId);

            if (!modLogChannel) {
                return interaction.editReply({
                    content: await t(interaction, 'core.moderation.warn.modlog.not.found'),
                });
            }

            if (!modLogChannel.permissionsFor(interaction.client.user).has('SEND_MESSAGES')) {
                return interaction.editReply({
                    content: await t(interaction, 'core.moderation.warn.modlog.no.permission'),
                });
            }

            try {
                const channelEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(
                        await t(interaction, 'core.moderation.warn.modlog.embed', {
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
                            await t(interaction, 'core.moderation.warn.modlog.timeout.embed', {
                                user: `<@${targetUser.id}>`,
                            })
                        )
                        .setTimestamp()
                        .setFooter(await embedFooter(interaction));
                    await modLogChannel.send({ embeds: [timeoutEmbed] });
                }
            } catch (err) {
                logger.warn('Failed to send log to modLogChannel:', err.message);
            }
        }

        const embed = new EmbedBuilder()
            .setColor(kythia.bot.color)
            .setDescription(
                await t(interaction, 'core.moderation.warn.success.embed', {
                    user: `<@${targetUser.id}>`,
                    reason,
                    timeout: timeoutApplied ? `\n\n${await t(interaction, 'core.moderation.warn.timeout.notice')}` : '',
                })
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter(await embedFooter(interaction));

        const warnEmbed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(
                await t(interaction, 'core.moderation.warn.dm.embed', {
                    user: `<@${targetUser.id}>`,
                    moderator: `<@${interaction.user.id}>`,
                    reason,
                    timeout: timeoutApplied ? `\n\n${await t(interaction, 'core.moderation.warn.dm.timeout.notice')}` : '',
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
