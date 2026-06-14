/**
 * @namespace: addons/economy/commands/marry/_group.js
 * @type: Subcommand Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { BaseCommand } = require('kythia-core');

class GroupCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (group) =>
		group.setName('marry').setDescription('💍 Marriage system commands');
}

exports.default = GroupCommand;
