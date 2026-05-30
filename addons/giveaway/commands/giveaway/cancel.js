/**
 * @namespace: addons/giveaway/commands/giveaway/cancel.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('cancel')
			.setDescription('Cancel a running giveaway')
			.addStringOption((option) =>
				option
					.setName('giveaway')
					.setDescription('Search active giveaway')
					.setAutocomplete(true)
					.setRequired(true),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	execute(interaction, container) {
		const { giveawayManager } = container;
		const messageId = interaction.options.getString('giveaway');
		return giveawayManager.cancelGiveaway(messageId, interaction);
	},
};
