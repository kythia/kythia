/**
 * @namespace: addons/leveling/commands/_command.js
 * @type: Command Group Definition
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */
const { SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
    guildOnly: true,
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('🏅 All commands related to the leveling system.')
        .setContexts(InteractionContextType.Guild),
};
