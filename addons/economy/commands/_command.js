/**
 * @namespace: addons/economy/commands/_command.js
 * @type: Command Group Definition
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
    subcommand: true,
    data: new SlashCommandBuilder()
        .setName('eco')
        .setDescription('💰 Get your money and become rich')
};
