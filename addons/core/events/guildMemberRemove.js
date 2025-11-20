/**
 * @namespace: addons/core/events/guildMemberRemove.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { AuditLogEvent, EmbedBuilder } = require('discord.js');

module.exports = async (bot, member) => {
    if (!member.guild) return;
    const container = bot.client.container;
    const { models, helpers } = container;
    const { ServerSetting } = models;
    const { convertColor } = helpers.color;

    try {
        const settings = await ServerSetting.getCache({ guildId: member.guild.id });
        if (!settings || !settings.auditLogChannelId) return;

        const logChannel = await member.guild.channels.fetch(settings.auditLogChannelId).catch(() => null);
        if (!logChannel || !logChannel.isTextBased()) return;

        // Check if it was a kick
        const kickAudit = await member.guild.fetchAuditLogs({
            type: AuditLogEvent.MemberKick,
            limit: 1,
        });

        const kickEntry = kickAudit.entries.find((e) => e.target?.id === member.id && e.createdTimestamp > Date.now() - 5000);

        if (kickEntry) {
            const embed = new EmbedBuilder()
                .setColor(convertColor('Red', { from: 'discord', to: 'decimal' }))
                .setAuthor({
                    name: kickEntry.executor?.tag || 'Unknown',
                    iconURL: kickEntry.executor?.displayAvatarURL?.(),
                })
                .setDescription(`👢 **Member Kicked** by <@${kickEntry.executor?.id || 'Unknown'}>`)
                .addFields(
                    { name: 'User', value: `${member.user.tag} (${member.user.id})`, inline: true },
                    { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`, inline: true },
                    {
                        name: 'Joined Server',
                        value: member.joinedAt ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:F>` : 'Unknown',
                        inline: true,
                    }
                )
                .setThumbnail(member.user.displayAvatarURL())
                .setFooter({ text: `User ID: ${kickEntry.executor?.id || 'Unknown'}` })
                .setTimestamp();

            if (kickEntry.reason) {
                embed.addFields({ name: 'Reason', value: kickEntry.reason });
            }

            await logChannel.send({ embeds: [embed] });
            return;
        }

        // Regular leave (not kicked)
        const embed = new EmbedBuilder()
            .setColor(convertColor('Orange', { from: 'discord', to: 'decimal' }))
            .setDescription(`👋 **Member Left**`)
            .addFields(
                { name: 'User', value: `${member.user.tag} (${member.user.id})`, inline: true },
                { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`, inline: true },
                {
                    name: 'Joined Server',
                    value: member.joinedAt ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:F>` : 'Unknown',
                    inline: true,
                }
            )
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp();

        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error('Error in guildMemberRemove audit log:', err);
    }
};
