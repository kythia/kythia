/**
 * @namespace: addons/core/commands/utils/kyth/team/_group.js
 * @type: Subcommand Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	subcommandGroup: true,
	slashCommand: (group) =>
		group.setName('team').setDescription('Manage Kythia Team members'),
};
