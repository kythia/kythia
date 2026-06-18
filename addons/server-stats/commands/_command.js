/**
 * @namespace: addons/server-stats/commands/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	PermissionFlagsBits,
	SlashCommandBuilder,
	InteractionContextType,
} = require('discord.js');
const { BaseCommand } = require('kythia-core');
class ServerStatsCommand extends BaseCommand {
	permissions = PermissionFlagsBits.ManageGuild;
	botPermissions = PermissionFlagsBits.ManageGuild;
	slashCommand = new SlashCommandBuilder()
		.setName('server-stats')
		.setDescription('Server statistics settings')
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);
}
exports.default = ServerStatsCommand;
