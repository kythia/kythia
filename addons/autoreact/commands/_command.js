/**
 * @namespace: addons/autoreact/commands/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class AutoreactCommand extends BaseCommand {
	guildOnly = true;

	slashCommand = new SlashCommandBuilder()
		.setName('autoreact')
		.setDescription('🤖 Manage automatic reactions for the server.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);
}

exports.default = AutoreactCommand;
