/**
 * @namespace: addons/quest/commands/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	InteractionContextType,
	SlashCommandBuilder,
	PermissionFlagsBits,
} = require('discord.js');

const { BaseCommand } = require('kythia-core');

class QuestCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('quest')
		.setDescription('🎁 Manage the Discord Quest Notifier system.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
		.setContexts(InteractionContextType.Guild);
}

exports.default = QuestCommand;
