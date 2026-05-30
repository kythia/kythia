/**
 * @namespace: addons/invite/commands/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
	slashCommand: new SlashCommandBuilder()
		.setName('invites')
		.setDescription('🔗 Manage invites and rewards')
		.setContexts(InteractionContextType.Guild),
};
