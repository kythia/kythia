/**
 * @namespace: addons/economy/commands/guild_stock/_group.js
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
			.setName('guild_stock')
			.setDescription("🏦 Interact with your server's local stock market.");
}

exports.default = GroupCommand;
