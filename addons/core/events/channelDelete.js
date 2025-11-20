/**
 * @namespace: addons/core/events/channelDelete.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { AuditLogEvent, EmbedBuilder, ChannelType } = require('discord.js');

/**
 * Handle anti-nuke system for channel deletion spam.
 */
async function handleAntiNuke(bot, channel, entry) {
    if (!entry || !entry.executor || entry.executor.bot) return;

    const container = bot.client.container;
    const { t, models } = container;
    const { ServerSetting } = models;

    if (!bot.client.channelDeleteTracker) {
        bot.client.channelDeleteTracker = new Map();
    }
    const userActionMap = bot.client.channelDeleteTracker;

    const MAX_ACTIONS = 3;
    const TIME_WINDOW = 10000;
    const userId = entry.executor.id;
    const guildId = channel.guild.id;
    const now = Date.now();

    if (!userActionMap.has(guildId)) userActionMap.set(guildId, new Map());
    const guildData = userActionMap.get(guildId);

    const userData = guildData.get(userId) || { count: 0, last: 0 };

    const diff = now - userData.last;
    userData.count = diff < TIME_WINDOW ? userData.count + 1 : 1;
    userData.last = now;

    guildData.set(userId, userData);

    if (userData.count >= MAX_ACTIONS) {
        const member = await channel.guild.members.fetch(userId).catch(() => null);
        if (!member || !member.kickable) return;

        try {
            await member.kick(await t(channel.guild, 'core.events.channelDelete.events.channel.delete.antinuke.reason'));

            const settings = await ServerSetting.getCache({ guildId: channel.guild.id });
            if (!settings || !settings.auditLogChannelId) return;

            const logChannel = await channel.guild.channels.fetch(settings.auditLogChannelId).catch(() => null);
            if (logChannel?.isTextBased()) {
                const message = await t(channel.guild, 'core.events.channelDelete.events.channel.delete.antinuke.kick.log', {
                    user: member.user.tag,
                });
                await logChannel.send(message);
            }
        } catch (err) {
            console.error(`Failed to kick member for anti-nuke (channelDelete):`, err);
        }

        userData.count = 0;
        guildData.set(userId, userData);
    }
}

module.exports = async (bot, channel) => {
    if (!channel.guild) return;
    const container = bot.client.container;
    const { models } = container;
    const { ServerSetting } = models;

    try {
        const audit = await channel.guild.fetchAuditLogs({
            type: AuditLogEvent.ChannelDelete,
            limit: 1,
        });

        // Try to match by .target?.id first (like in update), fallback to name if not found
        let entry = audit.entries.find((e) => e.target?.id === channel.id && e.createdTimestamp > Date.now() - 5000);

        if (!entry) {
            entry = audit.entries.find(
                (e) => e.changes?.some((c) => c.key === 'name' && c.old === channel.name) && e.createdTimestamp > Date.now() - 5000
            );
        }

        await handleAntiNuke(bot, channel, entry);

        // Send audit log embed if audit entry found and server configured
        const settings = await ServerSetting.getCache({ guildId: channel.guild.id });
        if (!settings || !settings.auditLogChannelId) return;

        const logChannel = await channel.guild.channels.fetch(settings.auditLogChannelId).catch(() => null);
        if (!logChannel || !logChannel.isTextBased() || !entry) return;

        // Humanize channel type (simple version)
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
            return channelTypeNames[type] || (typeof type === 'number' ? `Unknown (${type})` : 'Unknown');
        }

        // Use the typical color utility if available, else fallback
        let color;
        try {
            color = require('@utils/color')('Red', { from: 'discord', to: 'decimal' });
        } catch (e) {
            color = 0xed4245; // default Discord red
        }

        const embed = new EmbedBuilder()
            .setColor(color)
            .setAuthor({
                name: entry.executor?.tag || 'Unknown',
                iconURL: entry.executor?.displayAvatarURL?.(),
            })
            .setDescription(`🗑️ **Channel Deleted** by <@${entry.executor?.id || 'Unknown'}>`)
            .addFields(
                { name: 'Channel Name', value: channel.name || 'Unknown', inline: true },
                { name: 'Type', value: humanChannelType(channel.type), inline: true }
            )
            .setFooter({ text: `User ID: ${entry.executor?.id || 'Unknown'}` })
            .setTimestamp();

        if (entry.reason) {
            embed.addFields({ name: 'Reason', value: entry.reason });
        }

        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error('Error fetching audit logs for channelDelete:', err);
        if (kythia.sentry.dsn) {
            Sentry.captureException(err);
        }
    }
};
