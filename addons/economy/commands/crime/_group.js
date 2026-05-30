/**
 * @namespace: addons/economy/commands/crime/_group.js
 * @type: Subcommand Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	subcommand: true,
	slashCommand: (group) =>
		group
			.setName('crime')
			.setDescription('Commit crimes, bounties, and blackmarket.'),
};
