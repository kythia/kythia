/**
 * @namespace: addons/ticket/commands/panel/_group.js
 * @type: Subcommand Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { BaseCommand } = require('kythia-core');

class GroupCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommandGroup) =>
		subcommandGroup.setName('panel').setDescription('Manage Panel UI');
}

exports.default = GroupCommand;
