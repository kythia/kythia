/**
 * @namespace: addons/core/permissions.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    // Nama properti = nama folder kategori di dalam addon ini
    autosetup: {
        guildOnly: true,
        permissions: [PermissionFlagsBits.ManageGuild, PermissionFlagsBits.ManageChannels],
        botPermissions: [PermissionFlagsBits.ManageGuild, PermissionFlagsBits.ManageChannels],
    },
    embed: {
        guildOnly: true,
        permissions: PermissionFlagsBits.SendMessages,
        botPermissions: PermissionFlagsBits.SendMessages,
    },
    moderation: {
        // permissions: PermissionFlagsBits.ManageMessages,
        // botPermissions: PermissionFlagsBits.ManageMessages,
        guildOnly: true,
    },
    premium: {
        guildOnly: false,
    },
    setting: {
        guildOnly: true,
    },
    tools: {
        guildOnly: false,
    },
    utils: {
        guildOnly: false,
    },
};
