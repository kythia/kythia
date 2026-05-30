/**
 * @namespace: addons/fun/commands/marry/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { InteractionContextType, SlashCommandBuilder } = require('discord.js');

module.exports = {
	guildOnly: true,
	slashCommand: new SlashCommandBuilder()
		.setName('marry')
		.setDescription('💍 Marriage system commands')
		.setContexts(InteractionContextType.Guild),
};
