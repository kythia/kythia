/**
 * @namespace: addons/core/commands/utils/convert/temperature.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { tempChoices, convertTemperature } = require('../../../helpers/convert');

const { BaseCommand } = require('kythia-core');

class TemperatureCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('temperature')
			.setDescription('🌡️ Convert temperature (C, F, K, R, Re)')
			.addStringOption((option) =>
				option
					.setName('from')
					.setDescription('From unit')
					.setRequired(true)
					.addChoices(...tempChoices),
			)
			.addStringOption((option) =>
				option
					.setName('to')
					.setDescription('To unit')
					.setRequired(true)
					.addChoices(...tempChoices),
			)
			.addNumberOption((option) =>
				option
					.setName('value')
					.setDescription('Value to convert')
					.setRequired(true),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, helpers } = container;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const value = interaction.options.getNumber('value');
		const from = interaction.options.getString('from');
		const to = interaction.options.getString('to');
		const result = convertTemperature(value, from, to);

		if (result == null) {
			const components = await simpleContainer(
				interaction,
				`${await t(interaction, 'core.utils.convert.temperature.failed')}`,
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const desc =
			'' +
			(await t(interaction, 'core.utils.convert.temperature.title')) +
			'\n' +
			(await t(interaction, 'core.utils.convert.temperature.result', {
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
	}
}

exports.default = TemperatureCommand;
