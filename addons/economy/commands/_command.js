/**
 * @namespace: addons/economy/commands/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: new SlashCommandBuilder()
		.setName('eco')
		.setDescription('💰 Get your money and become rich'),
};
