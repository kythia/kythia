/**
 * @namespace: addons/core/commands/moderation/kick.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: (subcommand) =>
        subcommand
            .setName('kick')
            .setDescription('⚠️ Kick a user from the server.')
            .addUserOption((option) => option.setName('user').setDescription('User to kick').setRequired(true))
            .addStringOption((option) => option.setName('reason').setDescription('Reason for kick (optional)').setRequired(false)),
    permissions: PermissionFlagsBits.KickMembers,
    botPermissions: PermissionFlagsBits.KickMembers,
    async execute(interaction, container) {
        const { t, helpers, models } = container;
        const { embedFooter } = helpers.discord;
        const { ServerSetting } = models;

        await interaction.deferReply();
        const setting = ServerSetting.getCache({ guildId: interaction.guild.id });
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || (await t(interaction, 'core.moderation.kick.default.reason'));

        // Prevent self-kick
        if (user.id === interaction.user.id) {
            return interaction.editReply({
                content: await t(interaction, 'core.moderation.kick.cannot.self'),
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
                        .setTitle(await t(interaction, 'core.moderation.kick.modlog.title'))
                        .setDescription(
                            await t(interaction, 'core.moderation.kick.modlog.desc', {
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
                .setTitle(await t(interaction, 'core.moderation.kick.embed.title'))
                .setDescription(
                    await t(interaction, 'core.moderation.kick.embed.desc', {
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
                content: await t(interaction, 'core.moderation.kick.user.not.found'),
                ephemeral: true,
            });
        }
    },
};
