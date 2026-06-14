/**
 * @namespace: addons/pro/commands/claim/_group.js
 * @type: Subcommand Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { BaseCommand } = require('kythia-core');

class GroupCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommandGroup) =>
		subcommandGroup.setName('claim').setDescription('🌐 Klaim Your Rewards!');
}

exports.default = GroupCommand;
