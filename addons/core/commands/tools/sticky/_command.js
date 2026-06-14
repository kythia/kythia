/**
 * @namespace: addons/core/commands/tools/sticky/_command.js
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

class ToolsCommand extends BaseCommand {
	permissions = PermissionFlagsBits.ManageMessages;
	botPermissions = PermissionFlagsBits.ManageMessages;

	slashCommand = new SlashCommandBuilder()
		.setName('sticky')
		.setDescription('📌 Manage sticky messages in a channel.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.setContexts(InteractionContextType.Guild);

	guildOnly = true;
}

exports.default = ToolsCommand;
