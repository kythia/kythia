/**
 * @namespace: addons/image/commands/_command.js
 * @type: Command Group Definition
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
    guildOnly: false,
    data: new SlashCommandBuilder().setName('image').setDescription('Manage images in the storage'),
};
