/**
 * @namespace: addons/economy/commands/job/_group.js
 * @type: Subcommand Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	subcommand: true,
	slashCommand: (group) =>
		group.setName('job').setDescription('Manage your job and work for coins.'),
};
