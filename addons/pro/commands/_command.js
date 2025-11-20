/**
 * @namespace: addons/pro/commands/_command.js
 * @type: Command Group Definition
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pro')
        .setDescription('🌸 All commands related to the Kythia Pro users.')
        .setContexts(InteractionContextType.Guild),
};
