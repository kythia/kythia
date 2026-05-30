/**
 * @namespace: addons/pro/commands/dns/_group.js
 * @type: Subcommand Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
module.exports = {
	subcommand: true,
	slashCommand: (subcommandGroup) =>
		subcommandGroup
			.setName('dns')
			.setDescription('Kelola DNS record untuk subdomain Pro-mu.'),
};
