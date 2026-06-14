/**
 * @namespace: addons/fun/commands/friend/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { InteractionContextType, SlashCommandBuilder } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class CommandsCommand extends BaseCommand {
	guildOnly = true;

	slashCommand = new SlashCommandBuilder()
		.setName('friend')
		.setDescription('🤝 Friendship system commands')
		.setContexts(InteractionContextType.Guild);
}

exports.default = CommandsCommand;
