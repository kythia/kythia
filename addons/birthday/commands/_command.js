/**
 * @namespace: addons/birthday/commands/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { SlashCommandBuilder } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class BirthdayCommand extends BaseCommand {
	guildOnly = true;
	slashCommand = new SlashCommandBuilder()
		.setName('birthday')
		.setDescription('Manage your birthday settings.');
}
exports.default = BirthdayCommand;
