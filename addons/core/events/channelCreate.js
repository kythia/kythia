/**
 * @namespace: addons/core/events/channelCreate.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */

const { AuditLogEvent, EmbedBuilder, ChannelType } = require('discord.js');
const ServerSetting = require('@coreModels/ServerSetting');
const { t } = require('@utils/translator');

async function handleAntiNuke(bot, channel, entry) {
    if (!entry || !entry.executor || entry.executor.bot) return;

    if (!bot.client.channelCreateTracker) {
        bot.client.channelCreateTracker = new Map();
    }
    const userCreateMap = bot.client.channelCreateTracker;

    const MAX_CREATES = 3;
    const TIME_WINDOW = 10000;
    const userId = entry.executor.id;
    const guildId = channel.guild.id;
    const now = Date.now();

    if (!userCreateMap.has(guildId)) userCreateMap.set(guildId, new Map());
    const guildData = userCreateMap.get(guildId);

    const userData = guildData.get(userId) || { count: 0, last: 0 };

    const diff = now - userData.last;
    userData.count = diff < TIME_WINDOW ? userData.count + 1 : 1;
    userData.last = now;

    guildData.set(userId, userData);

    if (userData.count >= MAX_CREATES) {
        const member = await channel.guild.members.fetch(userId).catch(() => null);
        if (!member || !member.kickable) return;

        try {
            await member.kick(await t(channel.guild, 'core_events_channelCreate_events_channel_create_antinuke_reason'));

            const settings = await ServerSetting.getCache({ guildId: channel.guild.id });
            if (!settings || !settings.modLogChannelId) return;

            const logChannel = await channel.guild.channels.fetch(settings.modLogChannelId).catch(() => null);
            if (logChannel?.isTextBased()) {
                const message = await t(channel.guild, 'core_events_channelCreate_events_channel_create_antinuke_kick_log', {
                    user: member.user,
                });
                await logChannel.send(message);
            }
        } catch (err) {
            console.error(`Failed to kick member for anti-nuke:`, err);
        }

        userData.count = 0;
        guildData.set(userId, userData);
    }
}

module.exports = async (bot, channel) => {
    if (!channel.guild || ![ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildCategory].includes(channel.type)) return;

    try {
        const audit = await channel.guild.fetchAuditLogs({
            type: AuditLogEvent.ChannelCreate,
            limit: 1,
        });

        const entry = audit.entries.find((e) => e.target?.id === channel.id && e.createdTimestamp > Date.now() - 5000);

        await handleAntiNuke(bot, channel, entry);
    } catch (err) {
        console.error('Error fetching audit logs for channelCreate:', err);
    }
};
