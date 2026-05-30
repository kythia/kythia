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

module.exports = {
	slashCommand: new SlashCommandBuilder()
		.setName('quest')
		.setDescription('🎁 Manage the Discord Quest Notifier system.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
		.setContexts(InteractionContextType.Guild),
};
