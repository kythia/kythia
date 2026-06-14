/**
 * @namespace: addons/welcomer/commands/_command.js
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

class WelcomerCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('welcomer')
		.setDescription('👋 Configure the welcome & farewell system')
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

	guildOnly = true;
	permissions = [PermissionFlagsBits.ManageGuild];
}

exports.default = WelcomerCommand;
