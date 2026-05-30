/**
 * @namespace: addons/economy/commands/market/_group.js
 * @type: Subcommand Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	subcommand: true,
	slashCommand: (group) =>
		group
			.setName('market')
			.setDescription('📈 Interact with the Kythia Stock Exchange.'),
};
