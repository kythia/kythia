/**
 * @namespace: addons/server/commands/server/reset.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { resetServer } = require('./_helpers');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('reset')
			.setDescription('Reset server structure to default')
			.addBooleanOption((option) =>
				option
					.setName('clear')
					.setDescription('Delete all channels & roles first?')
					.setRequired(false),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 */
	async execute(interaction) {
		await interaction.deferReply();
		await resetServer(interaction);
	},
};
