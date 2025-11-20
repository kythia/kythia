/**
 * @namespace: addons/core/commands/premium/_command.js
 * @type: Command Group Definition
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    ownerOnly: true,
    data: new SlashCommandBuilder()
        .setName('premium')
        .setDescription('💰 Manage premium user status (add, delete, edit, list, info)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
};
