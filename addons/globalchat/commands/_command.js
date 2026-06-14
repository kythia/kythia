/**
 * @namespace: addons/globalchat/commands/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class GlobalchatCommand extends BaseCommand {
	guildOnly = true;

	slashCommand = new SlashCommandBuilder()
		.setName('globalchat')
		.setDescription('🌏 Manage global chat settings for this server')
		.setContexts(InteractionContextType.Guild);
}

exports.default = GlobalchatCommand;
