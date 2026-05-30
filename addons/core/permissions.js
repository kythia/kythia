/**
 * @namespace: addons/core/permissions.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { PermissionFlagsBits } = require('discord.js');

module.exports = {
	autosetup: {
		guildOnly: true,
		permissions: [
			PermissionFlagsBits.ManageGuild,
			PermissionFlagsBits.ManageChannels,
		],
		botPermissions: [
			PermissionFlagsBits.ManageGuild,
			PermissionFlagsBits.ManageChannels,
		],
	},
	embed: {
		guildOnly: true,
		permissions: PermissionFlagsBits.SendMessages,
		botPermissions: PermissionFlagsBits.SendMessages,
	},
	moderation: {
		// permissions: PermissionFlagsBits.ManageMessages,
		// botPermissions: PermissionFlagsBits.ManageMessages,
		guildOnly: true,
	},
	premium: {
		guildOnly: false,
	},
	setting: {
		guildOnly: true,
	},
	tools: {
		guildOnly: false,
	},
	utils: {
		guildOnly: false,
	},
};
