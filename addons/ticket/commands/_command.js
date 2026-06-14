/**
 * @namespace: addons/ticket/commands/_command.js
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

class TicketCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('ticket')
		.setDescription('🎟️ All commands related to kythia ticket system.')
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

	permissions = [PermissionFlagsBits.ManageGuild];
}

exports.default = TicketCommand;
