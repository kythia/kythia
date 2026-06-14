/**
 * @namespace: addons/activity/commands/achievement/_group.js
 * @type: Subcommand Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { BaseCommand } = require('kythia-core');

class GroupCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (group) =>
		group
			.setName('achievement')
			.setDescription('🏆 View and track your achievements.');
}

exports.default = GroupCommand;
