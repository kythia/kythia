/**
 * @namespace: addons/quest/commands/_command.js
 * @type: Command Group Definition
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { SlashCommandBuilder, PermissionFlagsBits, InteractionContextType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quest')
        .setDescription('🎁 Manage the Discord Quest Notifier system.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setIntegrationTypes(InteractionContextType.Guild),
};
