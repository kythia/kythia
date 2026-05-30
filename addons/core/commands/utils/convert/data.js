/**
 * @namespace: addons/core/commands/utils/convert/data.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { convertData, dataChoices } = require('./_helpers');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('data')
			.setDescription('💾 Convert data storage units (e.g. MB to GB)')
			.addStringOption((option) =>
				option
					.setName('from')
					.setDescription('From unit')
					.setRequired(true)
					.addChoices(...dataChoices),
			)
			.addStringOption((option) =>
				option
					.setName('to')
					.setDescription('To unit')
					.setRequired(true)
					.addChoices(...dataChoices),
			)
			.addNumberOption((option) =>
				option
					.setName('value')
					.setDescription('Value to convert')
					.setRequired(true),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, helpers } = container;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const value = interaction.options.getNumber('value');
		const from = interaction.options.getString('from');
		const to = interaction.options.getString('to');
		const result = convertData(value, from, to);

		if (result == null) {
			const components = await simpleContainer(
				interaction,
				`## ${await t(interaction, 'core.utils.convert.data.failed')}`,
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const desc =
			'## ' +
			(await t(interaction, 'core.utils.convert.data.title')) +
			'\n' +
			(await t(interaction, 'core.utils.convert.data.result', {
				value,
				from: from.toUpperCase(),
				result,
				to: to.toUpperCase(),
			}));

		const components = await simpleContainer(interaction, desc);
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
