/**
 * @namespace: addons/modmail/commands/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	InteractionContextType,
	PermissionFlagsBits,
	SlashCommandBuilder,
} = require('discord.js');

const { BaseCommand } = require('kythia-core');

class ModmailCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('modmail')
		.setDescription('📬 All commands related to the Modmail system.')
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

	permissions = [PermissionFlagsBits.ManageGuild];
}

exports.default = ModmailCommand;
