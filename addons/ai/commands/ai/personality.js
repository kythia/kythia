/**
 * @namespace: addons/ai/commands/ai/personality.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const PERSONALITIES = {
	default: {
		name: 'Default',
		description: '🔄 Follow config default setting',
		prompt: null, // Will use config default
	},
	friendly: {
		name: 'Friendly',
		description: '😊 Warm, casual, and approachable',
		prompt:
			'Be warm, friendly, and approachable. Use casual language and show empathy. Be encouraging and supportive.',
	},
	professional: {
		name: 'Professional',
		description: '💼 Formal, clear, and concise',
		prompt:
			'Be professional, formal, and to the point. Use proper grammar and maintain a business-like tone.',
	},
	humorous: {
		name: 'Humorous',
		description: '😄 Witty, playful, and fun',
		prompt:
			'Be witty, playful, and entertaining. Use humor appropriately and make conversations fun.',
	},
	technical: {
		name: 'Technical',
		description: '🤓 Detailed, precise, and informative',
		prompt:
			'Be detailed, precise, and technical. Provide in-depth information and explanations.',
	},
	casual: {
		name: 'Casual',
		description: '😎 Relaxed, laid-back, and chill',
		prompt:
			'Be relaxed, casual, and laid-back. Use informal language and keep things chill.',
	},
};

module.exports = {
	subcommand: true,
	premiumLocked: 'powerful',
	slashCommand: (subcommand) =>
		subcommand
			.setName('personality')
			.setDescription('Change AI personality/conversation style')
			.addStringOption((option) =>
				option
					.setName('style')
					.setDescription('Choose conversation style')
					.setRequired(true)
					.addChoices(
						...Object.entries(PERSONALITIES).map(([key, value]) => ({
							name: `${value.description}`,
							value: key,
						})),
					),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, helpers } = container;
		const { KythiaUser } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const personality = interaction.options.getString('style');
		const personalityData = PERSONALITIES[personality];

		// Get or create user
		const [user] = await KythiaUser.findOrCreate({
			where: { userId: interaction.user.id },
			defaults: {
				userId: interaction.user.id,
			},
		});

		// Update personality - set to null for 'default' to use config
		user.aiPersonality = personality === 'default' ? null : personality;
		await user.save();

		// Invalidate cache
		// await KythiaUser.invalidateCache([
		// 	`KythiaUser:userId:${interaction.user.id}`,
		// ]);

		// Show appropriate message
		let msg;
		if (personality === 'default') {
			msg = await t(interaction, 'ai.ai.personality.reset');
		} else {
			msg = await t(interaction, 'ai.ai.personality.success', {
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
	},
};
