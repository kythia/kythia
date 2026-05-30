/**
 * @namespace: addons/core/commands/utils/kyth/presence/_group.js
 * @type: Subcommand Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { ActivityType, PresenceUpdateStatus } = require('discord.js');

const STATUS_OPTIONS = Object.entries(PresenceUpdateStatus)
	.filter(([_k, v]) => typeof v === 'string')
	.map(([k]) => ({ name: k, value: k }));

const ACTIVITY_TYPE_OPTIONS = Object.entries(ActivityType)
	.filter(([_k, v]) => typeof v === 'number')
	.map(([k]) => ({ name: k, value: k }));

module.exports = {
	subcommandGroup: true,
	slashCommand: (group) =>
		group
			.setName('presence')
			.setDescription('🔄 Manage bot client user settings'),
	// Export shared constants for use by subcommands
	STATUS_OPTIONS,
	ACTIVITY_TYPE_OPTIONS,
};
