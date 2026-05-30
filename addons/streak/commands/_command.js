/**
 * @namespace: addons/streak/commands/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { InteractionContextType, SlashCommandBuilder } = require('discord.js');

module.exports = {
	slashCommand: new SlashCommandBuilder()
		.setName('streak')
		.setDescription('All commands related to the streak system.')
		.setContexts(InteractionContextType.Guild),
	guildOnly: true,
};
