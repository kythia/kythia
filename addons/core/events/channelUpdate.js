/**
 * @namespace: addons/core/events/channelUpdate.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { AuditLogEvent, EmbedBuilder, ChannelType } = require('discord.js');

// Human readable channel types
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

function formatChanges(changes) {
    if (!changes || changes.length === 0) return 'No changes detected.';
    return changes
        .map((change) => {
            let key = change.key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
            let oldValue = change.old ?? 'Nothing';
            let newValue = change.new ?? 'Nothing';

            // Humanize channel type
            if (change.key === 'type') {
                oldValue = humanChannelType(oldValue);
                newValue = humanChannelType(newValue);
            }

            return `**${key}**: \`${oldValue}\` ➔ \`${newValue}\``;
        })
        .join('\n');
}

module.exports = async (bot, oldChannel, newChannel) => {
    if (!newChannel.guild) return;
    const container = bot.client.container;
    const { t, models, helpers } = container;
    const { ServerSetting } = models;
    const { convertColor } = helpers.color;

    try {
        const settings = await ServerSetting.getCache({ guildId: newChannel.guild.id });
        if (!settings || !settings.auditLogChannelId) return;

        const logChannel = await newChannel.guild.channels.fetch(settings.auditLogChannelId).catch(() => null);
        if (!logChannel || !logChannel.isTextBased()) return;

        const audit = await newChannel.guild.fetchAuditLogs({
            type: AuditLogEvent.ChannelUpdate,
            limit: 1,
        });

        const entry = audit.entries.find((e) => e.target?.id === newChannel.id && e.createdTimestamp > Date.now() - 5000);

        if (!entry) return;

        const embed = new EmbedBuilder()
            .setColor(convertColor('Blurple', { from: 'discord', to: 'decimal' }))
            .setAuthor({
                name: entry.executor?.tag || 'Unknown',
                iconURL: entry.executor?.displayAvatarURL?.(),
            })
            .setDescription(`📝 **Channel Updated** by <@${entry.executor?.id || 'Unknown'}>`)
            .addFields(
                { name: 'Channel', value: `<#${newChannel.id}>`, inline: true },
                { name: 'Type', value: humanChannelType(newChannel.type), inline: true },
                { name: 'Changes', value: formatChanges(entry.changes) }
            )
            .setFooter({ text: `User ID: ${entry.executor?.id || 'Unknown'}` })
            .setTimestamp();

        if (entry.reason) {
            embed.addFields({ name: 'Reason', value: entry.reason });
        }

        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error('Error in channelUpdate audit log:', err);
    }
};
