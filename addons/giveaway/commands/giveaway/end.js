/**
 * @namespace: addons/giveaway/commands/giveaway/end.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { BaseCommand } = require('kythia-core');

class EndCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('end')
			.setDescription('End a giveaway manually')
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
		return giveawayManager.endGiveaway(messageId, interaction);
	}
}

exports.default = EndCommand;
