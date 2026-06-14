/**
 * @namespace: addons/giveaway/commands/giveaway/reroll.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { BaseCommand } = require('kythia-core');

class RerollCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('reroll')
			.setDescription('Reroll winners for a finished giveaway')
			.addStringOption((option) =>
				option
					.setName('giveaway')
					.setDescription('Search ended giveaway')
					.setAutocomplete(true)
					.setRequired(true),
			);

	execute(interaction) {
		const container = this.container;
		const { giveawayManager } = container;
		const messageId = interaction.options.getString('giveaway');
		return giveawayManager.rerollGiveaway(messageId, interaction);
	}
}

exports.default = RerollCommand;
