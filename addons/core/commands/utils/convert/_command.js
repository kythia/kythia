/**
 * @namespace: addons/core/commands/utils/convert/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { SlashCommandBuilder } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class UtilsCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('convert')
		.setDescription('🔄 Convert between units, currencies, etc.');
}

exports.default = UtilsCommand;
