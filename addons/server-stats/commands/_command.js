/**
 * @namespace: addons/server-stats/commands/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	SlashCommandBuilder,
	PermissionFlagsBits,
	InteractionContextType,
} = require('discord.js');

module.exports = {
	slashCommand: new SlashCommandBuilder()
		.setName('server-stats')
		.setDescription('📈 Server statistics settings')
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
	permissions: PermissionFlagsBits.ManageGuild,
	botPermissions: PermissionFlagsBits.ManageGuild,
};
