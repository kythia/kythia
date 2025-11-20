/**
 * @namespace: addons/core/events/roleUpdate.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { AuditLogEvent, EmbedBuilder } = require('discord.js');
const { rolePrefix } = require('../helpers');

module.exports = async (bot, oldRole, newRole) => {
    if (!newRole.guild) return;
    const container = bot.client.container;
    const { models, helpers } = container;
    const { ServerSetting } = models;
    const { convertColor } = helpers.color;

    try {
        const setting = await ServerSetting.getCache({ guildId: newRole.guild.id });
        if (!setting || !setting.auditLogChannelId) return;

        if (setting.rolePrefixOn) {
            await rolePrefix(member.guild);
        }

        const logChannel = await newRole.guild.channels.fetch(setting.auditLogChannelId).catch(() => null);
        if (!logChannel || !logChannel.isTextBased()) return;

        const audit = await newRole.guild.fetchAuditLogs({
            type: AuditLogEvent.RoleUpdate,
            limit: 1,
        });

        const entry = audit.entries.find((e) => e.target?.id === newRole.id && e.createdTimestamp > Date.now() - 5000);

        if (!entry) return;

        const embed = new EmbedBuilder()
            .setColor(convertColor('Yellow', { from: 'discord', to: 'decimal' }))
            .setAuthor({
                name: entry.executor?.tag || 'Unknown',
                iconURL: entry.executor?.displayAvatarURL?.(),
            })
            .setDescription(`✏️ **Role Updated** by <@${entry.executor?.id || 'Unknown'}>`)
            .addFields(
                { name: 'Role', value: `<@&${newRole.id}>`, inline: true },
                { name: 'Old Name', value: oldRole.name, inline: true },
                { name: 'New Name', value: newRole.name, inline: true },
                { name: 'Old Color', value: oldRole.hexColor || 'Default', inline: true },
                { name: 'New Color', value: newRole.hexColor || 'Default', inline: true },
                { name: 'Old Position', value: oldRole.position.toString(), inline: true },
                { name: 'New Position', value: newRole.position.toString(), inline: true },
                { name: 'Mentionable', value: newRole.mentionable ? 'Yes' : 'No', inline: true },
                { name: 'Hoisted', value: newRole.hoist ? 'Yes' : 'No', inline: true },
                { name: 'Managed', value: newRole.managed ? 'Yes' : 'No', inline: true }
            )
            .setFooter({ text: `User ID: ${entry.executor?.id || 'Unknown'}` })
            .setTimestamp();

        if (entry.reason) {
            embed.addFields({ name: 'Reason', value: entry.reason });
        }

        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error('Error in guildRoleUpdate audit log:', err);
    }
};
