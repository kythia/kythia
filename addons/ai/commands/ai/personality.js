/**
 * @namespace: addons/ai/commands/ai/personality.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
const constantsHelper = require('../../helpers/constants');

// PERSONALITIES extracted to addons/ai/helpers/constants.js

class PersonalityCommand extends BaseCommand {
	premiumLocked = 'powerful';
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('personality')
			.setDescription('Change AI personality/conversation style')
			.addStringOption((option) =>
				option
					.setName('style')
					.setDescription('Choose conversation style')
					.setRequired(true)
					.addChoices(
						...Object.entries(constantsHelper.PERSONALITIES).map(
							([key, value]) => ({
								name: `${value.description}`,
								value: key,
							}),
						),
					),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { KythiaUser } = models;
		const { simpleContainer } = helpers.discord;
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});
		const personality = interaction.options.getString('style') || 'default';
		const personalityData =
			constantsHelper.PERSONALITIES[personality] ||
			constantsHelper.PERSONALITIES.default;

		// Get or create user
		const [user] = await KythiaUser.findOrCreateCache({
			where: {
				userId: interaction.user.id,
			},
			defaults: {
				userId: interaction.user.id,
			},
		});

		// Update personality - set to null for 'default' to use config
		user.aiPersonality = personality === 'default' ? null : personality;
		await user.save();

		// Show appropriate message
		let msg;
		if (personality === 'default') {
			msg = await t(interaction, 'ai.commands.ai.personality.ai.reset');
		} else {
			msg = await t(interaction, 'ai.commands.ai.personality.ai.success', {
				personality: personalityData.name,
				description: personalityData.description,
			});
		}
		const components = await simpleContainer(interaction, msg, {
			color: 'Green',
		});
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
exports.default = PersonalityCommand;
