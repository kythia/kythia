/**
 * @namespace: addons/nsfw/commands/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { InteractionContextType, SlashCommandBuilder } = require('discord.js');

module.exports = {
	voteLocked: true,
	slashCommand: new SlashCommandBuilder()
		.setName('spicy')
		.setDescription(
			'🌶️ Explore mature content (restricted to age-verified channels)',
		)
		.setContexts(InteractionContextType.Guild)
		.setNSFW(true),
};
