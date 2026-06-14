/**
 * @namespace: addons/streak/commands/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class StreakCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('streak')
		.setDescription('All commands related to the streak system.')
		.setContexts(InteractionContextType.Guild);

	guildOnly = true;
}

exports.default = StreakCommand;
