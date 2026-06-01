/**
 * @namespace: addons/_counting/commands/config.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
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
					.setDescription('Counting mode (base).')
					.addChoices(
						{ name: 'Decimal (Base 10)', value: 'decimal' },
						{ name: 'Binary (Base 2)', value: 'binary' },
						{ name: 'Hexadecimal (Base 16)', value: 'hex' },
						{ name: 'Roman Numerals', value: 'roman' },
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
					.setDescription('Reset the count to 0 when a mistake is made.'),
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
			await counting.saveAndUpdateCache();
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
