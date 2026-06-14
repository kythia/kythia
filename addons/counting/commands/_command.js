/**
 * @namespace: addons/counting/commands/_command.js
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

class CountingCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('counting')
		.setDescription('🔢 Manage the counting channel.')
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

	guildOnly = true;
}

exports.default = CountingCommand;
