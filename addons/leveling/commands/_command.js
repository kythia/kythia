/**
 * @namespace: addons/leveling/commands/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class LevelingCommand extends BaseCommand {
	guildOnly = true;
	slashCommand = new SlashCommandBuilder()
		.setName('level')
		.setDescription('All commands related to the leveling system.')
		.setContexts(InteractionContextType.Guild);
}
exports.default = LevelingCommand;
