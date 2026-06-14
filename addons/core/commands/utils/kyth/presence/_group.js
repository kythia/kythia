/**
 * @namespace: addons/core/commands/utils/kyth/presence/_group.js
 * @type: Subcommand Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

// Constants extracted to addons/core/helpers/presence-constants.js
const { BaseCommand } = require('kythia-core');

class GroupCommand extends BaseCommand {
	subcommandGroup = true;

	slashCommand = (group) =>
		group
			.setName('presence')
			.setDescription('🔄 Manage bot client user settings');
}

exports.default = GroupCommand;
