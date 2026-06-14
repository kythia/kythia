/**
 * @namespace: addons/streak/commands/setting/_group.js
 * @type: Subcommand Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { SlashCommandBuilder } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class GroupCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('setting')
		.setDescription('🔥 Setting for streak system');
}

exports.default = GroupCommand;
