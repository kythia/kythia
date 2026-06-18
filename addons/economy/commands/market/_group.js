/**
 * @namespace: addons/economy/commands/market/_group.js
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
			.setName('market')
			.setDescription('Interact with the Kythia Stock Exchange.');
}
exports.default = GroupCommand;
