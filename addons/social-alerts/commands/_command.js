/**
 * @namespace: addons/social-alerts/commands/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { SlashCommandBuilder } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class SocialAlertsCommand extends BaseCommand {
	guildOnly = true;

	slashCommand = new SlashCommandBuilder()
		.setName('social-alert')
		.setDescription('📡 Manage YouTube social alerts for this server.');
}

exports.default = SocialAlertsCommand;
