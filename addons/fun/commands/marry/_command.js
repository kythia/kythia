/**
 * @namespace: addons/fun/commands/marry/_command.js
 * @type: Command Group Definition
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
    guildOnly: true,
    data: new SlashCommandBuilder()
        .setName('marry')
        .setDescription('💍 Marriage system commands')
        .setContexts(InteractionContextType.Guild),
};
