/**
 * @namespace: addons/ticket/commands/type/_group.js
 * @type: Subcommand Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { BaseCommand } = require('kythia-core');

class GroupCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommandGroup) =>
		subcommandGroup
			.setName('type')
			.setDescription('Manage ticket types (e.g., "Report", "Ask")');
}

exports.default = GroupCommand;
