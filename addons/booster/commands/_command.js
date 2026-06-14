/**
 * @namespace: addons/booster/commands/_command.js
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

class BoosterCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('booster')
		.setDescription('🚀 Configure the server booster system')
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

	guildOnly = true;
	permissions = [PermissionFlagsBits.ManageGuild];
}

exports.default = BoosterCommand;
