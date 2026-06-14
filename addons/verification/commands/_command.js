/**
 * @namespace: addons/verification/commands/_command.js
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

class VerificationCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('verification')
		.setDescription('🛡️ Verification system management')
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);
}

exports.default = VerificationCommand;
