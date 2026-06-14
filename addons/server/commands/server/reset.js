/**
 * @namespace: addons/server/commands/server/reset.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { resetServer } = require('./_helpers');

const { BaseCommand } = require('kythia-core');

class ResetCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('reset')
			.setDescription('Reset server structure to default')
			.addBooleanOption((option) =>
				option
					.setName('clear')
					.setDescription('Delete all channels & roles first?')
					.setRequired(false),
			);

	async execute(interaction) {
		await interaction.deferReply();
		await resetServer(interaction);
	}
}

exports.default = ResetCommand;
