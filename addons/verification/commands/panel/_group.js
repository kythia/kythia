/**
 * @namespace: addons/verification/commands/panel/_group.js
 * @type: Subcommand Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { SlashCommandSubcommandGroupBuilder } = require('discord.js');

module.exports = {
	slashCommand: new SlashCommandSubcommandGroupBuilder()
		.setName('panel')
		.setDescription('Verification panel management'),
};
