/**
 * @namespace: addons/ai/commands/ai/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { SlashCommandBuilder } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class CommandsCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('ai')
		.setDescription('🧠 All commands related to kythia ai system.');
}

exports.default = CommandsCommand;
