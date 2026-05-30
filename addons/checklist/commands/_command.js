/**
 * @namespace: addons/checklist/commands/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
	guildOnly: true,
	slashCommand: new SlashCommandBuilder()
		.setName('checklist')
		.setDescription(
			'📝 Create checklists for you or your server to make life easier',
		)
		.setContexts(InteractionContextType.Guild),
};
