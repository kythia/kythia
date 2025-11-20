/**
 * @namespace: addons/core/events/stickerCreate.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { AuditLogEvent, EmbedBuilder } = require('discord.js');

module.exports = async (bot, sticker) => {
    if (!sticker.guild) return;
    const container = bot.client.container;
    const { models, helpers } = container;
    const { ServerSetting } = models;
    const { convertColor } = helpers.color;

    try {
        const settings = await ServerSetting.getCache({ guildId: sticker.guild.id });
        if (!settings || !settings.auditLogChannelId) return;

        const logChannel = await sticker.guild.channels.fetch(settings.auditLogChannelId).catch(() => null);
        if (!logChannel || !logChannel.isTextBased()) return;

        const audit = await sticker.guild.fetchAuditLogs({
            type: AuditLogEvent.StickerCreate,
            limit: 1,
        });

        const entry = audit.entries.find((e) => e.target?.id === sticker.id && e.createdTimestamp > Date.now() - 5000);

        if (!entry) return;

        const embed = new EmbedBuilder()
            .setColor(convertColor('Green', { from: 'discord', to: 'decimal' }))
            .setAuthor({
                name: entry.executor?.tag || 'Unknown',
                iconURL: entry.executor?.displayAvatarURL?.(),
            })
            .setDescription(`🏷️ **Sticker Created** by <@${entry.executor?.id || 'Unknown'}>`)
            .addFields(
                { name: 'Sticker', value: `<:${sticker.name}:${sticker.id}>`, inline: true },
                { name: 'Name', value: sticker.name, inline: true },
                { name: 'Description', value: sticker.description || 'No description', inline: false },
                { name: 'Available', value: sticker.available ? 'Yes' : 'No', inline: true },
                { name: 'Managed', value: sticker.managed ? 'Yes' : 'No', inline: true }
            )
            .setThumbnail(sticker.url)
            .setFooter({ text: `User ID: ${entry.executor?.id || 'Unknown'}` })
            .setTimestamp();

        if (entry.reason) {
            embed.addFields({ name: 'Reason', value: entry.reason });
        }

        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error('Error in guildStickerCreate audit log:', err);
    }
};
