/**
 * @namespace: addons/core/events/inviteCreate.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { AuditLogEvent, EmbedBuilder } = require('discord.js');

module.exports = async (bot, invite) => {
    if (!invite.guild) return;
    const container = bot.client.container;
    const { t, models, helpers, kythiaConfig } = container;
    const { ServerSetting } = models;
    const { convertColor } = helpers.color;

    try {
        const settings = await ServerSetting.getCache({ guildId: invite.guild.id });
        if (!settings || !settings.auditLogChannelId) return;

        const logChannel = await invite.guild.channels.fetch(settings.auditLogChannelId).catch(() => null);
        if (!logChannel || !logChannel.isTextBased()) return;

        const audit = await invite.guild.fetchAuditLogs({
            type: AuditLogEvent.InviteCreate,
            limit: 1,
        });

        const entry = audit.entries.find((e) => e.target?.code === invite.code && e.createdTimestamp > Date.now() - 5000);

        if (!entry) return;

        const embed = new EmbedBuilder()
            .setColor(convertColor('Green', { from: 'discord', to: 'decimal' }))
            .setAuthor({
                name: entry.executor?.tag || 'Unknown',
                iconURL: entry.executor?.displayAvatarURL?.(),
            })
            .setDescription(`🔗 **Invite Created** by <@${entry.executor?.id || 'Unknown'}>`)
            .addFields(
                { name: 'Invite Code', value: invite.code, inline: true },
                { name: 'Channel', value: invite.channel ? `<#${invite.channel.id}>` : 'Unknown', inline: true },
                { name: 'Max Uses', value: invite.maxUses ? invite.maxUses.toString() : 'Unlimited', inline: true },
                { name: 'Max Age', value: invite.maxAge ? `${invite.maxAge} seconds` : 'Never expires', inline: true },
                { name: 'Temporary', value: invite.temporary ? 'Yes' : 'No', inline: true },
                { name: 'Created At', value: `<t:${Math.floor(invite.createdTimestamp / 1000)}:F>`, inline: true }
            )
            .setFooter({ text: `User ID: ${entry.executor?.id || 'Unknown'}` })
            .setTimestamp();

        if (entry.reason) {
            embed.addFields({ name: 'Reason', value: entry.reason });
        }

        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error('Error in inviteCreate audit log:', err);
    }
};
