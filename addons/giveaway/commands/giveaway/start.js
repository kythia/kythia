/**
 * @namespace: addons/giveaway/commands/giveaway/start.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('start')
			.setDescription('Start a giveaway')
			.addStringOption((option) =>
				option
					.setName('duration')
					.setDescription('Duration (1d 2h)')
					.setRequired(true),
			)
			.addIntegerOption((option) =>
				option.setName('winners').setDescription('Count').setRequired(true),
			)
			.addStringOption((option) =>
				option.setName('prize').setDescription('Prize').setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('description')
					.setDescription('Description for the giveaway')
					.setRequired(false),
			)
			.addStringOption((option) =>
				option.setName('color').setDescription('Hex Color').setRequired(false),
			)
			.addRoleOption((option) =>
				option.setName('role').setDescription('Req Role').setRequired(false),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	execute(interaction, container) {
		const { giveawayManager } = container;
		return giveawayManager.createGiveaway(interaction);
	},
};
