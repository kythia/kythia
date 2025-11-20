/**
 * @namespace: addons/core/events/channelCreate.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { AuditLogEvent, EmbedBuilder, ChannelType } = require('discord.js');

async function handleAntiNuke(bot, channel, entry) {
    const container = bot.client.container;
    const { t, models } = container;
    const { ServerSetting } = models;

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
            await member.kick(await t(channel.guild, 'core.events.channelCreate.events.channel.create.antinuke.reason'));

            const settings = await ServerSetting.getCache({ guildId: channel.guild.id });
            if (!settings || !settings.auditLogChannelId) return;

            const logChannel = await channel.guild.channels.fetch(settings.auditLogChannelId).catch(() => null);
            if (logChannel?.isTextBased()) {
                const message = await t(channel.guild, 'core.events.channelCreate.events.channel.create.antinuke.kick.log', {
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
    const container = bot.client.container;
    const { models } = container;
    const { ServerSetting } = models;

    if (!channel.guild || ![ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildCategory].includes(channel.type)) return;

    try {
        const audit = await channel.guild.fetchAuditLogs({
            type: AuditLogEvent.ChannelCreate,
            limit: 1,
        });

        const entry = audit.entries.find((e) => e.target?.id === channel.id && e.createdTimestamp > Date.now() - 5000);

        await handleAntiNuke(bot, channel, entry);

        // Send audit log embed if audit entry found and server configured
        const settings = await ServerSetting.getCache({ guildId: channel.guild.id });
        if (!settings || !settings.auditLogChannelId) return;

        const logChannel = await channel.guild.channels.fetch(settings.auditLogChannelId).catch(() => null);
        if (!logChannel || !logChannel.isTextBased() || !entry) return;

        const embed = new EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({
                name: entry.executor?.tag || 'Unknown',
                iconURL: entry.executor?.displayAvatarURL?.(),
            })
            .setDescription(`📢 **Channel Created** by <@${entry.executor?.id || 'Unknown'}>`)
            .addFields(
                { name: 'Channel', value: `<#${channel.id}> (${channel.name})`, inline: true },
                {
                    name: 'Type',
                    value:
                        channel.type === ChannelType.GuildText
                            ? 'Text Channel'
                            : channel.type === ChannelType.GuildVoice
                              ? 'Voice Channel'
                              : channel.type === ChannelType.GuildCategory
                                ? 'Category'
                                : `Unknown (${channel.type})`,
                    inline: true,
                }
            )
            .setFooter({ text: `User ID: ${entry.executor?.id || 'Unknown'}` })
            .setTimestamp();

        if (entry.reason) {
            embed.addFields({ name: 'Reason', value: entry.reason });
        }

        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error('Error fetching audit logs for channelCreate:', err);
    }
};
