/**
 * @namespace: addons/core/commands/utils/global-announcement/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	PermissionFlagsBits,
	SlashCommandBuilder,
	InteractionContextType,
} = require('discord.js');

const { BaseCommand } = require('kythia-core');

class UtilsCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('global-announcement')
		.setDescription('Send an announcement to all servers the bot has joined.')
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

	ownerOnly = true;
	mainGuildOnly = true;
}

exports.default = UtilsCommand;
