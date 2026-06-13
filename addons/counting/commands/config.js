/**
 * @namespace: addons/counting/commands/config.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('config')
			.setDescription('Configure counting settings.')
			.addStringOption((option) =>
				option
					.setName('mode')
					.setDescription('The number format to use.')
					.addChoices(
						{ name: 'Normal Numbers (1, 2, 3...)', value: 'decimal' },
						{ name: 'Roman Numerals (I, II, III, IV...)', value: 'roman' },
						{ name: 'Binary / Hacker (1, 10, 11, 100...)', value: 'binary' },
						{ name: 'Hexadecimal (1...9, A, B, C...)', value: 'hex' },
					),
			)
			.addStringOption((option) =>
				option
					.setName('success_reaction')
					.setDescription('Emoji to react with when the number is correct.'),
			)
			.addStringOption((option) =>
				option
					.setName('fail_reaction')
					.setDescription('Emoji to react with when the number is wrong.'),
			)
			.addBooleanOption((option) =>
				option
					.setName('math')
					.setDescription('Allow math expressions (decimal mode only).'),
			)
			.addBooleanOption((option) =>
				option
					.setName('strict')
					.setDescription(
						'Enable strict counting. if 1 user false, count will reset to 0.',
					)
					.setRequired(false),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { models, t, helpers } = container;
		const { Counting } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const counting = await Counting.getCache({ guildId: interaction.guild.id });
		if (!counting) {
			await interaction.editReply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'counting.game.not_enabled'),
					{ color: 'Red' },
				),
				flags: MessageFlags.IsComponentsV2,
			});
			return;
		}

		const mode = interaction.options.getString('mode');
		const success = interaction.options.getString('success_reaction');
		const fail = interaction.options.getString('fail_reaction');
		const math = interaction.options.getBoolean('math');
		const strict = interaction.options.getBoolean('strict');

		let updated = false;

		if (mode) {
			counting.mode = mode;
			updated = true;
		}
		if (success) {
			// Basic emoji validation could go here, but let's assume valid or discord.js handles reaction errors gracefully
			counting.successReaction = success;
			updated = true;
		}
		if (fail) {
			counting.failReaction = fail;
			updated = true;
		}
		if (math !== null) {
			counting.mathEnabled = math;
			updated = true;
		}
		if (strict !== null) {
			counting.strictEnabled = strict;
			updated = true;
		}

		if (updated) {
			await counting.save();
			const desc = await t(interaction, 'counting.config.success');
			await interaction.editReply({
				components: await simpleContainer(interaction, desc, {
					color: 'Green',
				}),
				flags: MessageFlags.IsComponentsV2,
			});
		} else {
			const desc = await t(interaction, 'counting.config.no_changes');
			await interaction.editReply({
				components: await simpleContainer(interaction, desc, {
					color: 'Yellow',
				}),
				flags: MessageFlags.IsComponentsV2,
			});
		}
	},
};
