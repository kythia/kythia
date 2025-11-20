/**
 * @namespace: addons/core/events/emojiDelete.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { AuditLogEvent, EmbedBuilder } = require('discord.js');

module.exports = async (bot, emoji) => {
    if (!emoji.guild) return;
    const container = bot.client.container;
    const { t, models, helpers } = container;
    const { ServerSetting } = models;
    const { convertColor } = helpers.color;

    try {
        const settings = await ServerSetting.getCache({ guildId: emoji.guild.id });
        if (!settings || !settings.auditLogChannelId) return;

        const logChannel = await emoji.guild.channels.fetch(settings.auditLogChannelId).catch(() => null);
        if (!logChannel || !logChannel.isTextBased()) return;

        const audit = await emoji.guild.fetchAuditLogs({
            type: AuditLogEvent.EmojiDelete,
            limit: 1,
        });

        const entry = audit.entries.find((e) => e.target?.id === emoji.id && e.createdTimestamp > Date.now() - 5000);

        if (!entry) return;

        const embed = new EmbedBuilder()
            .setColor(convertColor('Red', { from: 'discord', to: 'decimal' }))
            .setAuthor({
                name: entry.executor?.tag || 'Unknown',
                iconURL: entry.executor?.displayAvatarURL?.(),
            })
            .setDescription(`😃 **Emoji Deleted** by <@${entry.executor?.id || 'Unknown'}>`)
            .addFields(
                { name: 'Emoji Name', value: emoji.name, inline: true },
                { name: 'Animated', value: emoji.animated ? 'Yes' : 'No', inline: true },
                { name: 'Available', value: emoji.available ? 'Yes' : 'No', inline: true },
                { name: 'Managed', value: emoji.managed ? 'Yes' : 'No', inline: true }
            )
            .setThumbnail(emoji.url)
            .setFooter({ text: `User ID: ${entry.executor?.id || 'Unknown'}` })
            .setTimestamp();

        if (entry.reason) {
            embed.addFields({ name: 'Reason', value: entry.reason });
        }

        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error('Error in guildEmojiDelete audit log:', err);
    }
};
