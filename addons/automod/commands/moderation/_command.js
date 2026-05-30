/**
 * @namespace: addons/automod/commands/moderation/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	slashCommand: new SlashCommandBuilder()
		.setName('mod')
		.setDescription('Moderation action')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
};
