/**
 * @namespace: addons/social-alerts/commands/setting/_group.js
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
			.setName('setting')
			.setDescription('Configure Social Alerts addon settings.');
}
exports.default = GroupCommand;
