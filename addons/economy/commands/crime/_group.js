/**
 * @namespace: addons/economy/commands/crime/_group.js
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
			.setName('crime')
			.setDescription('Commit crimes, bounties, and blackmarket.');
}

exports.default = GroupCommand;
