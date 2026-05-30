/**
 * @namespace: addons/checklist/commands/server/_group.js
 * @type: Subcommand Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	subcommand: true,
	slashCommand: (group) =>
		group.setName('server').setDescription('Manage server checklist (public)'),
};
