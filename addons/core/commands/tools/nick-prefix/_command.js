/**
 * @namespace: addons/core/commands/tools/nick-prefix/_command.js
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
		.setName('nickprefix')
		.setDescription('📛 Adds or removes a prefix from member nicknames.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
		.setContexts(InteractionContextType.Guild),
	guildOnly: true,
	permissions: PermissionFlagsBits.ManageNicknames,
	botPermissions: PermissionFlagsBits.ManageNicknames,
};
