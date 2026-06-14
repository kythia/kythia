/**
 * @namespace: addons/core/commands/premium-server/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { SlashCommandBuilder } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class CommandsCommand extends BaseCommand {
	subcommand = true;

	slashCommand = new SlashCommandBuilder()
		.setName('premium-server')
		.setDescription('💎 Manage your Server Premium bindings');
}

exports.default = CommandsCommand;
