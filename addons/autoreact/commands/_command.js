/**
 * @namespace: addons/autoreact/commands/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	guildOnly: true,
	slashCommand: new SlashCommandBuilder()
		.setName('autoreact')
		.setDescription('🤖 Manage automatic reactions for the server.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
};
