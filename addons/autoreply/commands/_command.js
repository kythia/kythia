/**
 * @namespace: addons/autoreply/commands/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class AutoreplyCommand extends BaseCommand {
	guildOnly = true;
	slashCommand = new SlashCommandBuilder()
		.setName('autoreply')
		.setDescription('Manage custom auto-replies for your server.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);
}
exports.default = AutoreplyCommand;
