/**
 * @namespace: addons/automod/commands/moderation/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class CommandsCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('mod')
		.setDescription('Moderation action')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
}

exports.default = CommandsCommand;
