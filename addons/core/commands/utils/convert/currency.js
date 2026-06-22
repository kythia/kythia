/**
 * @namespace: addons/core/commands/utils/convert/currency.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { convertCurrency } = require('../../../helpers/convert');
const { BaseCommand } = require('kythia-core');
class CurrencyCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('currency')
			.setDescription('Convert currency (e.g. USD to IDR)')
			.addStringOption((option) =>
				option
					.setName('from')
					.setDescription('Currency code (e.g. USD)')
					.setRequired(true)
					.setMinLength(3)
					.setMaxLength(3),
			)
			.addStringOption((option) =>
				option
					.setName('to')
					.setDescription('Currency code to convert to (e.g. IDR)')
					.setRequired(true)
					.setMinLength(3)
					.setMaxLength(3),
			)
			.addNumberOption((option) =>
				option
					.setName('amount')
					.setDescription('Amount to convert')
					.setRequired(true),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, helpers, logger } = container;
		const { simpleContainer } = helpers.discord;
		await interaction.deferReply();
		const amount = interaction.options.getNumber('amount');
		const from = interaction.options.getString('from').toUpperCase();
		const to = interaction.options.getString('to').toUpperCase();
		try {
			const result = await convertCurrency(container, amount, from, to);
			if (result == null) {
				const components = await simpleContainer(
					interaction,
					`${await t(interaction, 'core.commands.utils.convert.currency.failed')}`,
					{
						color: 'Red',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			const desc =
				'' +
				(await t(interaction, 'core.commands.utils.convert.currency.title')) +
				'\n' +
				(await t(interaction, 'core.commands.utils.convert.currency.result', {
					amount,
					from,
					result: result.toLocaleString(undefined, {
						maximumFractionDigits: 4,
					}),
					to,
				}));
			const components = await simpleContainer(interaction, desc);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (e) {
			logger.error(`Currency convert error: ${e.message || e}`, {
				label: 'convert',
			});
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'core.commands.utils.convert.currency.error'),
				{
					color: 'Red',
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}
exports.default = CurrencyCommand;
