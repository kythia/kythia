/**
 * @namespace: addons/activity/commands/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { InteractionContextType, SlashCommandBuilder } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class ActivityCommand extends BaseCommand {
	guildOnly = true;

	slashCommand = new SlashCommandBuilder()
		.setName('activity')
		.setDescription('📊 All commands related to activity statistics.')
		.setContexts(InteractionContextType.Guild);
}

exports.default = ActivityCommand;
