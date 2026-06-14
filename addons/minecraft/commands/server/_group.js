/**
 * @namespace: addons/minecraft/commands/server/_group.js
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
			.setName('server')
			.setDescription('Check the status of a Minecraft server');
}

exports.default = GroupCommand;
