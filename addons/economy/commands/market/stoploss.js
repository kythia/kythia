/**
 * @namespace: addons/economy/commands/market/stoploss.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags } = require('discord.js');
const { ASSET_IDS } = require('../../helpers/market');
const { TOP_STOCKS } = require('../../helpers/stock');

const { BaseCommand } = require('kythia-core');

class StoplossCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('stoploss')
			.setDescription(
				'Set a stop-loss order to sell an asset if it reaches a certain price.',
			)
			.addStringOption((option) =>
				option
					.setName('asset')
					.setDescription('The symbol of the asset')
					.setRequired(true)
					.setAutocomplete(true),
			)
			.addNumberOption((option) =>
				option
					.setName('quantity')
					.setDescription('The amount of the asset to sell')
					.setRequired(true)
					.setMinValue(0.000001),
			)
			.addNumberOption((option) =>
				option
					.setName('price')
					.setDescription('The price at which to trigger the sell order')
					.setRequired(true)
					.setMinValue(0.01),
			);

	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused().toLowerCase();
		const combined = [
			...ASSET_IDS.map((id) => id.toUpperCase()),
			...TOP_STOCKS,
		];

		const filtered = combined.filter((choice) =>
			choice.toLowerCase().includes(focusedValue),
		);

		await interaction.respond(
			filtered
				.slice(0, 25)
				.map((choice) => ({ name: choice, value: choice.toLowerCase() })),
		);
	}

	async execute(interaction) {
		const container = this.container;
		const { t, models, kythiaConfig, helpers, logger } = container;
		const { KythiaUser, MarketPortfolio, MarketOrder } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const assetId = interaction.options.getString('asset');
		const quantity = interaction.options.getNumber('quantity');
		const price = interaction.options.getNumber('price');

		if (assetId === 'kyth') {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'economy.market.stoploss.unsupported_md'),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const isCrypto = ASSET_IDS.includes(assetId);
		if (!isCrypto) {
			const { getStockData } = require('../../helpers/stock');
			const stockData = await getStockData(assetId);
			if (!stockData) {
				const msg = await t(
					interaction,
					'economy.market.buy.asset.not.found.desc',
				);
				const components = await simpleContainer(interaction, msg, {
					color: kythiaConfig.bot.color,
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		}

		const user = await KythiaUser.getCache({ userId: interaction.user.id });
		if (!user) {
			const msg = await t(interaction, 'economy.withdraw.no.account.desc');
			const components = await simpleContainer(interaction, msg, {
				color: kythiaConfig.bot.color,
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		try {
			const holding = await MarketPortfolio.getCache({
				userId: interaction.user.id,
				assetId: assetId,
			});

			if (!holding || holding.quantity < quantity) {
				const msg = await t(
					interaction,
					'economy.market.sell.insufficient.asset.desc',
					{ asset: assetId.toUpperCase() },
				);
				const components = await simpleContainer(interaction, msg, {
					color: 'Red',
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			const order = await MarketOrder.create({
				userId: interaction.user.id,
				assetId,
				type: 'stoploss',
				side: 'sell',
				quantity,
				price,
			});

			holding.quantity -= quantity;
			if (holding.quantity > 0) {
				await holding.save();
			} else {
				await holding.destroy();
			}

			const msg = await t(
				interaction,
				'economy.market.stoploss.sell.success.desc',
				{
					quantity,
					asset: assetId.toUpperCase(),
					price: price.toLocaleString(),
					orderId: order.id,
				},
			);
			const components = await simpleContainer(interaction, msg, {
				color: 'Yellow',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			logger.error(`Error in stop-loss order: ${error.message || error}`, {
				label: 'economy:market:stoploss',
			});
			const msg = await t(interaction, 'economy.market.order.error.desc');
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}

exports.default = StoplossCommand;
