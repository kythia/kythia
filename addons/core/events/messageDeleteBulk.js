/**
 * @namespace: addons/core/events/messageDeleteBulk.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { AuditLogEvent, EmbedBuilder } = require('discord.js');

module.exports = async (bot, messages, channel) => {
    if (!channel.guild) return;
    const container = bot.client.container;
    const { t, models, helpers, kythiaConfig } = container;
    const { ServerSetting } = models;
    const { convertColor } = helpers.color;

    try {
        const settings = await ServerSetting.getCache({ guildId: channel.guild.id });
        if (!settings || !settings.auditLogChannelId) return;

        const logChannel = await channel.guild.channels.fetch(settings.auditLogChannelId).catch(() => null);
        if (!logChannel || !logChannel.isTextBased()) return;

        const audit = await channel.guild.fetchAuditLogs({
            type: AuditLogEvent.MessageBulkDelete,
            limit: 1,
        });

        const entry = audit.entries.find((e) => e.extra?.channel?.id === channel.id && e.createdTimestamp > Date.now() - 5000);

        if (!entry) return;

        const embed = new EmbedBuilder()
            .setColor(convertColor('Red', { from: 'discord', to: 'decimal' }))
            .setAuthor({
                name: entry.executor?.tag || 'Unknown',
                iconURL: entry.executor?.displayAvatarURL?.(),
            })
            .setDescription(`🗑️ **Bulk Message Delete** by <@${entry.executor?.id || 'Unknown'}>`)
            .addFields(
                { name: 'Channel', value: `<#${channel.id}>`, inline: true },
                { name: 'Messages Deleted', value: messages.size.toString(), inline: true },
                {
                    name: 'Message IDs',
                    value: Array.from(messages.keys()).slice(0, 10).join(', ') + (messages.size > 10 ? '...' : ''),
                    inline: false,
                }
            )
            .setFooter({ text: `User ID: ${entry.executor?.id || 'Unknown'}` })
            .setTimestamp();

        if (entry.reason) {
            embed.addFields({ name: 'Reason', value: entry.reason });
        }

        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error('Error in messageBulkDelete audit log:', err);
    }
};
