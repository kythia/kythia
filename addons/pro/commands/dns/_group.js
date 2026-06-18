/**
 * @namespace: addons/pro/commands/dns/_group.js
 * @type: Subcommand Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { BaseCommand } = require('kythia-core');

class GroupCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommandGroup) =>
		subcommandGroup
			.setName('dns')
			.setDescription('Manage DNS records for your Pro subdomain.')
			.setDescriptionLocalizations({
				id: 'Kelola DNS record untuk subdomain Pro-mu.',
			});
}

exports.default = GroupCommand;
