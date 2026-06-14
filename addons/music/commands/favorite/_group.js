/**
 * @namespace: addons/music/commands/favorite/_group.js
 * @type: Subcommand Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { BaseCommand } = require('kythia-core');

class GroupCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (group) =>
		group.setName('favorite').setDescription('Manage favorite commands.');
}

exports.default = GroupCommand;
