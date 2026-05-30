/**
 * @namespace: addons/pet/commands/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { InteractionContextType, SlashCommandBuilder } = require('discord.js');

module.exports = {
	guildOnly: true,
	slashCommand: new SlashCommandBuilder()
		.setName('pet')
		.setDescription('🐾 All commands related to the pet system.')
		.setContexts(InteractionContextType.Guild),
};
