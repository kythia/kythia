/**
 * @namespace: addons/core/events/guildMemberUpdate.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { AuditLogEvent, EmbedBuilder } = require('discord.js');
const { rolePrefix } = require('../helpers');

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

module.exports = async (bot, oldMember, newMember) => {
    if (!newMember.guild) return;
    const container = bot.client.container;
    const { t, models, helpers, kythiaConfig } = container;
    const { ServerSetting } = models;
    const { convertColor } = helpers.color;

    try {
        const setting = await ServerSetting.getCache({ guildId: newMember.guild.id });
        if (!setting || !setting.auditLogChannelId) return;

        if (setting.rolePrefixOn) {
            await rolePrefix(oldMember.guild);
        }

        const logChannel = await newMember.guild.channels.fetch(setting.auditLogChannelId).catch(() => null);
        if (!logChannel || !logChannel.isTextBased()) return;

        const audit = await newMember.guild.fetchAuditLogs({
            type: AuditLogEvent.MemberUpdate,
            limit: 1,
        });

        const entry = audit.entries.find((e) => e.target?.id === newMember.id && e.createdTimestamp > Date.now() - 5000);

        if (!entry) return;

        const embed = new EmbedBuilder()
            .setColor(convertColor('Blurple', { from: 'discord', to: 'decimal' }))
            .setAuthor({
                name: entry.executor?.tag || 'Unknown',
                iconURL: entry.executor?.displayAvatarURL?.(),
            })
            .setDescription(`📝 **Member Updated** by <@${entry.executor?.id || 'Unknown'}>`)
            .addFields(
                { name: 'Member', value: `<@${newMember.id}>`, inline: true },
                { name: 'Changes', value: formatChanges(entry.changes) }
            )
            .setThumbnail(newMember.user.displayAvatarURL())
            .setFooter({ text: `User ID: ${entry.executor?.id || 'Unknown'}` })
            .setTimestamp();

        if (entry.reason) {
            embed.addFields({ name: 'Reason', value: entry.reason });
        }

        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error('Error in guildMemberUpdate audit log:', err);
    }
};
