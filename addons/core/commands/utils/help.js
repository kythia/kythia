/**
 * @namespace: addons/core/commands/utils/help.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, SlashCommandBuilder } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class HelpCommand extends BaseCommand {
	aliases = ['h'];

	slashCommand = new SlashCommandBuilder()
		.setName('help')
		.setDescription('Displays a list of bot commands with complete details.');

	async execute(interaction) {
		const container = this.container;
		const { helpers } = container;
		const { getHelpData, buildHelpReply } = helpers.helpUtils;

		const helpData = await getHelpData(container, interaction);

		const state = {
			userId: interaction.user.id,
			categoryPage: 0,
			selectedCategory: null,
			docPage: 0,
		};

		const initialReply = await buildHelpReply(
			container,
			interaction,
			state,
			helpData,
		);
		await interaction.reply({
			...initialReply,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = HelpCommand;
