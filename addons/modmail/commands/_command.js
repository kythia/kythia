/**
 * @namespace: addons/modmail/commands/_command.js
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

class ModmailCommand extends BaseCommand {
	permissions = [PermissionFlagsBits.ManageGuild];

	slashCommand = new SlashCommandBuilder()
		.setName('modmail')
		.setDescription('📬 All commands related to the Modmail system.')
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);
}

exports.default = ModmailCommand;
