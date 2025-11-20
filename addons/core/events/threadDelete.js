/**
 * @namespace: addons/core/events/threadDelete.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { AuditLogEvent, EmbedBuilder, ChannelType } = require('discord.js');

const channelTypeNames = {
    [ChannelType.GuildText]: 'Text Channel',
    [ChannelType.GuildVoice]: 'Voice Channel',
    [ChannelType.GuildCategory]: 'Category',
    [ChannelType.GuildAnnouncement]: 'Announcement Channel',
    [ChannelType.AnnouncementThread]: 'Announcement Thread',
    [ChannelType.PublicThread]: 'Public Thread',
    [ChannelType.PrivateThread]: 'Private Thread',
    [ChannelType.GuildStageVoice]: 'Stage Channel',
    [ChannelType.GuildForum]: 'Forum Channel',
    [ChannelType.GuildMedia]: 'Media Channel',
    [ChannelType.GuildDirectory]: 'Directory Channel',
    [ChannelType.GuildStore]: 'Store Channel',
    [ChannelType.DM]: 'Direct Message',
    [ChannelType.GroupDM]: 'Group DM',
};

function humanChannelType(type) {
    if (typeof type === 'string' && channelTypeNames[type]) return channelTypeNames[type];
    if (typeof type === 'number' && channelTypeNames[type]) return channelTypeNames[type];
    if (typeof type === 'string') return type;
    if (typeof type === 'number') return `Unknown (${type})`;
    return 'Unknown';
}

module.exports = async (bot, thread) => {
    if (!thread.guild) return;
    const container = bot.client.container;
    const { models, helpers } = container;
    const { ServerSetting } = models;
    const { convertColor } = helpers.color;

    try {
        const settings = await ServerSetting.getCache({ guildId: thread.guild.id });
        if (!settings || !settings.auditLogChannelId) return;

        const logChannel = await thread.guild.channels.fetch(settings.auditLogChannelId).catch(() => null);
        if (!logChannel || !logChannel.isTextBased()) return;

        const audit = await thread.guild.fetchAuditLogs({
            type: AuditLogEvent.ThreadDelete,
            limit: 1,
        });

        const entry = audit.entries.find((e) => e.target?.id === thread.id && e.createdTimestamp > Date.now() - 5000);

        if (!entry) return;

        const embed = new EmbedBuilder()
            .setColor(convertColor('Red', { from: 'discord', to: 'decimal' }))
            .setAuthor({
                name: entry.executor?.tag || 'Unknown',
                iconURL: entry.executor?.displayAvatarURL?.(),
            })
            .setDescription(`🧵 **Thread Deleted** by <@${entry.executor?.id || 'Unknown'}>`)
            .addFields(
                { name: 'Thread Name', value: thread.name, inline: true },
                { name: 'Type', value: humanChannelType(thread.type), inline: true },
                { name: 'Parent Channel', value: thread.parent ? `<#${thread.parent.id}>` : 'None', inline: true },
                { name: 'Archived', value: thread.archived ? 'Yes' : 'No', inline: true },
                { name: 'Locked', value: thread.locked ? 'Yes' : 'No', inline: true },
                { name: 'Auto Archive Duration', value: `${thread.autoArchiveDuration} minutes`, inline: true }
            )
            .setFooter({ text: `User ID: ${entry.executor?.id || 'Unknown'}` })
            .setTimestamp();

        if (entry.reason) {
            embed.addFields({ name: 'Reason', value: entry.reason });
        }

        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error('Error in threadDelete audit log:', err);
    }
};
