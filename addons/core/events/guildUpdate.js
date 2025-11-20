/**
 * @namespace: addons/core/events/guildUpdate.js
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

module.exports = async (bot, oldGuild, newGuild) => {
    const container = bot.client.container;
    const { t, models, helpers, kythiaConfig } = container;
    const { ServerSetting } = models;
    const { convertColor } = helpers.color;

    if (!newGuild) return;

    try {
        const settings = await ServerSetting.getCache({ guildId: newGuild.id });
        if (!settings || !settings.auditLogChannelId) return;

        const logChannel = await newGuild.channels.fetch(settings.auditLogChannelId).catch(() => null);
        if (!logChannel || !logChannel.isTextBased()) return;

        const audit = await newGuild.fetchAuditLogs({
            type: AuditLogEvent.GuildUpdate,
            limit: 1,
        });

        const entry = audit.entries.find((e) => e.target?.id === newGuild.id && e.createdTimestamp > Date.now() - 5000);

        if (!entry) return;

        const embed = new EmbedBuilder()
            .setColor(convertColor('Blurple', { from: 'discord', to: 'decimal' }))
            .setAuthor({
                name: entry.executor?.tag || 'Unknown',
                iconURL: entry.executor?.displayAvatarURL?.(),
            })
            .setDescription(`🛠️ **Guild Updated** by <@${entry.executor?.id || 'Unknown'}>`)
            .addFields({ name: 'Guild', value: newGuild.name, inline: true }, { name: 'Changes', value: formatChanges(entry.changes) })
            .setThumbnail(newGuild.iconURL())
            .setFooter({ text: `User ID: ${entry.executor?.id || 'Unknown'}` })
            .setTimestamp();

        if (entry.reason) {
            embed.addFields({ name: 'Reason', value: entry.reason });
        }

        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error('Error in guildUpdate audit log:', err);
    }
};
