/**
 * @namespace: addons/core/commands/utils/kyth/presence/_group.js
 * @type: Subcommand Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { ActivityType, PresenceUpdateStatus } = require('discord.js');

const { BaseCommand } = require('kythia-core');

const STATUS_OPTIONS = Object.entries(PresenceUpdateStatus)
	.filter(([_k, v]) => typeof v === 'string')
	.map(([k]) => ({ name: k, value: k }));

const ACTIVITY_TYPE_OPTIONS = Object.entries(ActivityType)
	.filter(([_k, v]) => typeof v === 'number')
	.map(([k]) => ({ name: k, value: k }));

class GroupCommand extends BaseCommand {
	subcommandGroup = true;

	slashCommand = (group) =>
		group
			.setName('presence')
			.setDescription('🔄 Manage bot client user settings');

	STATUS_OPTIONS = STATUS_OPTIONS;
	ACTIVITY_TYPE_OPTIONS = ACTIVITY_TYPE_OPTIONS;
}

exports.default = GroupCommand;

// Also export constants directly so sibling commands can destructure them:
// const { ACTIVITY_TYPE_OPTIONS } = require('./_group');
exports.STATUS_OPTIONS = STATUS_OPTIONS;
exports.ACTIVITY_TYPE_OPTIONS = ACTIVITY_TYPE_OPTIONS;
