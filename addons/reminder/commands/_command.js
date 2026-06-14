/**
 * @namespace: addons/reminder/commands/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { BaseCommand } = require('kythia-core');
const { SlashCommandBuilder } = require('discord.js');

class ReminderCommand extends BaseCommand {
	guildOnly = true;

	slashCommand = new SlashCommandBuilder()
		.setName('reminder')
		.setDescription('Manage your personal reminders across Kythia.');
}

module.exports = ReminderCommand;
