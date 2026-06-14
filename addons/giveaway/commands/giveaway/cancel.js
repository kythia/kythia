/**
 * @namespace: addons/giveaway/commands/giveaway/cancel.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { BaseCommand } = require('kythia-core');

class CancelCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('cancel')
			.setDescription('Cancel a running giveaway')
			.addStringOption((option) =>
				option
					.setName('giveaway')
					.setDescription('Search active giveaway')
					.setAutocomplete(true)
					.setRequired(true),
			);

	execute(interaction) {
		const container = this.container;
		const { giveawayManager } = container;
		const messageId = interaction.options.getString('giveaway');
		return giveawayManager.cancelGiveaway(messageId, interaction);
	}
}

exports.default = CancelCommand;
