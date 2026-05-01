/**
 * @namespace: addons/leveling/commands/setting/leveling/_group.js
 * @type: Subcommand Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	slashCommand: new SlashCommandBuilder()
		.setName('setting')
		.setDescription('🎮 Setting for leveling system'),
};
