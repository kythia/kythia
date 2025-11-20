/**
 * @namespace: addons/core/events/stickerUpdate.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { AuditLogEvent, EmbedBuilder } = require('discord.js');

function formatChanges(changes) {
    if (!changes || changes.length === 0) return 'No changes detected.';
    return changes
        .map((change) => {
            let key = change.key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
            let oldValue = change.old ?? 'Nothing';
            let newValue = change.new ?? 'Nothing';

            return `**${key}**: \`${oldValue}\` ➔ \`${newValue}\``;
        })
        .join('\n');
}

module.exports = async (bot, oldSticker, newSticker) => {
    if (!newSticker.guild) return;
    const container = bot.client.container;
    const { models, helpers } = container;
    const { ServerSetting } = models;
    const { convertColor } = helpers.color;

    try {
        const settings = await ServerSetting.getCache({ guildId: newSticker.guild.id });
        if (!settings || !settings.auditLogChannelId) return;

        const logChannel = await newSticker.guild.channels.fetch(settings.auditLogChannelId).catch(() => null);
        if (!logChannel || !logChannel.isTextBased()) return;

        const audit = await newSticker.guild.fetchAuditLogs({
            type: AuditLogEvent.StickerUpdate,
            limit: 1,
        });

        const entry = audit.entries.find((e) => e.target?.id === newSticker.id && e.createdTimestamp > Date.now() - 5000);

        if (!entry) return;

        const embed = new EmbedBuilder()
            .setColor(convertColor('Blurple', { from: 'discord', to: 'decimal' }))
            .setAuthor({
                name: entry.executor?.tag || 'Unknown',
                iconURL: entry.executor?.displayAvatarURL?.(),
            })
            .setDescription(`🏷️ **Sticker Updated** by <@${entry.executor?.id || 'Unknown'}>`)
            .addFields(
                { name: 'Sticker', value: `<:${newSticker.name}:${newSticker.id}>`, inline: true },
                { name: 'Changes', value: formatChanges(entry.changes) }
            )
            .setThumbnail(newSticker.url)
            .setFooter({ text: `User ID: ${entry.executor?.id || 'Unknown'}` })
            .setTimestamp();

        if (entry.reason) {
            embed.addFields({ name: 'Reason', value: entry.reason });
        }

        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error('Error in guildStickerUpdate audit log:', err);
    }
};
