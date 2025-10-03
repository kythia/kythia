/**
 * @namespace: addons/core/commands/moderation/lock.js
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
        .setName('lock')
        .setDescription('🔒 Locks a channel to prevent messages.')
        .addChannelOption((option) => option.setName('channel').setDescription('Channel to lock').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setContexts(InteractionContextType.Guild),
    permissions: PermissionFlagsBits.ManageChannels,
    botPermissions: PermissionFlagsBits.ManageChannels,
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const channel = interaction.options.getChannel('channel') || interaction.channel;

        // Try to lock the channel (set @everyone SEND_MESSAGES to false)
        try {
            await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
                SendMessages: false,
                SendMessagesInThreads: false,
                AddReactions: false,
            });
        } catch (e) {
            return interaction.editReply({
                content: await t(interaction, 'core_moderation_lock_failed'),
                ephemeral: true,
            });
        }

        // Embed to notify the channel
        try {
            const lockEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(
                    await t(interaction, 'core_moderation_lock_embed_channel_locked', {
                        user: `<@${interaction.user.id}>`,
                    })
                )
                .setThumbnail(interaction.user.displayAvatarURL())
                .setTimestamp()
                .setFooter(await embedFooter(interaction));
            await channel.send({ embeds: [lockEmbed] });
        } catch (_) {
            // ignore error if can't send
        }

        // Embed reply to the user
        const embed = new EmbedBuilder()
            .setColor(kythia.bot.color)
            .setDescription(
                await t(interaction, 'core_moderation_lock_embed_reply', {
                    channel: `<#${channel.id}>`,
                })
            )
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp()
            .setFooter(await embedFooter(interaction));

        return interaction.editReply({ embeds: [embed] });
    },
};
