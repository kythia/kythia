/**
 * @namespace: addons/core/events/roleCreate.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { AuditLogEvent, EmbedBuilder } = require('discord.js');

module.exports = async (bot, role) => {
    if (!role.guild) return;
    const container = bot.client.container;
    const { models, helpers } = container;
    const { ServerSetting } = models;
    const { convertColor } = helpers.color;

    try {
        const settings = await ServerSetting.getCache({ guildId: role.guild.id });
        if (!settings || !settings.auditLogChannelId) return;

        const logChannel = await role.guild.channels.fetch(settings.auditLogChannelId).catch(() => null);
        if (!logChannel || !logChannel.isTextBased()) return;

        const audit = await role.guild.fetchAuditLogs({
            type: AuditLogEvent.RoleCreate,
            limit: 1,
        });

        const entry = audit.entries.find((e) => e.target?.id === role.id && e.createdTimestamp > Date.now() - 5000);

        if (!entry) return;

        const embed = new EmbedBuilder()
            .setColor(convertColor('Green', { from: 'discord', to: 'decimal' }))
            .setAuthor({
                name: entry.executor?.tag || 'Unknown',
                iconURL: entry.executor?.displayAvatarURL?.(),
            })
            .setDescription(`➕ **Role Created** by <@${entry.executor?.id || 'Unknown'}>`)
            .addFields(
                { name: 'Role', value: `<@&${role.id}>`, inline: true },
                { name: 'Color', value: role.hexColor || 'Default', inline: true },
                { name: 'Position', value: role.position.toString(), inline: true },
                { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
                { name: 'Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
                { name: 'Managed', value: role.managed ? 'Yes' : 'No', inline: true }
            )
            .setFooter({ text: `User ID: ${entry.executor?.id || 'Unknown'}` })
            .setTimestamp();

        if (entry.reason) {
            embed.addFields({ name: 'Reason', value: entry.reason });
        }

        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error('Error in guildRoleCreate audit log:', err);
    }
};
