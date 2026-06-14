/**
 * @namespace: addons/reaction-role/commands/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { SlashCommandBuilder } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class ReactionRoleCommand extends BaseCommand {
	guildOnly = true;

	slashCommand = new SlashCommandBuilder()
		.setName('reaction-role')
		.setDescription('🎭 Manage reaction roles for your server.')
		.setDMPermission(false);
}

exports.default = ReactionRoleCommand;
