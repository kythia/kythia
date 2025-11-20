/**
 * @namespace: addons/core/events/guildBanAdd.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { AuditLogEvent, EmbedBuilder } = require('discord.js');

module.exports = async (bot, ban) => {
    if (!ban.guild) return;
    const container = bot.client.container;
    const { t, models, helpers } = container;
    const { ServerSetting } = models;
    const { convertColor } = helpers.color;

    try {
        const settings = await ServerSetting.getCache({ guildId: ban.guild.id });
        if (!settings || !settings.auditLogChannelId) return;

        const logChannel = await ban.guild.channels.fetch(settings.auditLogChannelId).catch(() => null);
        if (!logChannel || !logChannel.isTextBased()) return;

        const audit = await ban.guild.fetchAuditLogs({
            type: AuditLogEvent.MemberBanAdd,
            limit: 1,
        });

        const entry = audit.entries.find((e) => e.target?.id === ban.user.id && e.createdTimestamp > Date.now() - 5000);

        if (!entry) return;

        const embed = new EmbedBuilder()
            .setColor(convertColor('Red', { from: 'discord', to: 'decimal' }))
            .setAuthor({
                name: entry.executor?.tag || 'Unknown',
                iconURL: entry.executor?.displayAvatarURL?.(),
            })
            .setDescription(`🔨 **Member Banned** by <@${entry.executor?.id || 'Unknown'}>`)
            .addFields(
                { name: 'User', value: `${ban.user.tag} (${ban.user.id})`, inline: true },
                { name: 'Account Created', value: `<t:${Math.floor(ban.user.createdTimestamp / 1000)}:F>`, inline: true },
                { name: 'Reason', value: ban.reason || 'No reason provided', inline: false }
            )
            .setThumbnail(ban.user.displayAvatarURL())
            .setFooter({ text: `User ID: ${entry.executor?.id || 'Unknown'}` })
            .setTimestamp();

        if (entry.reason) {
            embed.addFields({ name: 'Audit Reason', value: entry.reason });
        }

        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error('Error in guildBanAdd audit log:', err);
    }
};
