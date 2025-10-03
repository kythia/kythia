/**
 * @namespace: addons/adventure/commands/_command.js
 * @type: Command Group Definition
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */
const { SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
    guildOnly: true,
    data: new SlashCommandBuilder()
        .setName('adventure')
        .setDescription('⚔️ Start your adventure in RPG dimension!')
        .setContexts(InteractionContextType.Guild),
};
