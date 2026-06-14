/**
 * @namespace: addons/modmail/commands/areply.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { relayStaffReply } = require('../helpers');

const { BaseCommand } = require('kythia-core');

class AreplyCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('areply')
			.setDescription(
				'Reply anonymously — the user will see "Staff" instead of your name.',
			)
			.addStringOption((option) =>
				option
					.setName('message')
					.setDescription('The anonymous message to send to the user.')
					.setRequired(true)
					.setMaxLength(2000),
			);

	execute(interaction) {
		const container = this.container;
		const content = interaction.options.getString('message');
		return relayStaffReply(interaction, content, true, container);
	}
}

exports.default = AreplyCommand;
