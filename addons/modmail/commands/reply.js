/**
 * @namespace: addons/modmail/commands/reply.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { relayStaffReply } = require('../helpers');

const { BaseCommand } = require('kythia-core');

class ReplyCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('reply')
			.setDescription('Reply to the user — your username will be visible.')
			.addStringOption((option) =>
				option
					.setName('message')
					.setDescription('The message to send to the user.')
					.setRequired(true)
					.setMaxLength(2000),
			);

	execute(interaction) {
		const container = this.container;
		const content = interaction.options.getString('message');
		return relayStaffReply(interaction, content, false, container);
	}
}

exports.default = ReplyCommand;
