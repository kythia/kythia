/**
 * @namespace: addons/tempvoice/commands/_command.js
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

class TempvoiceCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('tempvoice')
		.setDescription('🎧 Manage and customize the Kythia TempVoice system')
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);
}

exports.default = TempvoiceCommand;
