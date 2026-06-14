/**
 * @namespace: addons/verification/commands/setup/_group.js
 * @type: Subcommand Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { SlashCommandSubcommandGroupBuilder } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class GroupCommand extends BaseCommand {
	slashCommand = new SlashCommandSubcommandGroupBuilder()
		.setName('setup')
		.setDescription('Configure the verification system');
}

exports.default = GroupCommand;
