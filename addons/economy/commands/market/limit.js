/**
 * @namespace: addons/economy/commands/market/limit.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags } = require('discord.js');
const { ASSET_IDS } = require('../../helpers/market');
const { TOP_STOCKS } = require('../../helpers/stock');
const { toBigIntSafe } = require('../../helpers/bigint');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('limit')
			.setDescription(
				'Set a limit order to buy or sell an asset at a specific price.',
			)
			.addStringOption((option) =>
				option
					.setName('side')
					.setDescription('Whether to buy or sell the asset')
					.setRequired(true)
					.addChoices(
						{ name: 'Buy', value: 'buy' },
						{ name: 'Sell', value: 'sell' },
					),
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
					.setDescription('The amount of the asset to buy or sell')
					.setRequired(true)
					.setMinValue(0.000001),
			)
			.addNumberOption((option) =>
				option
					.setName('price')
					.setDescription('The price at which to place the order')
					.setRequired(true)
					.setMinValue(0.01),
			),

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
	},

	async execute(interaction, container) {
		const { t, models, kythiaConfig, helpers, logger } = container;
		const { KythiaUser, MarketPortfolio, MarketOrder } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const side = interaction.options.getString('side');
		const assetId = interaction.options.getString('asset');
		const quantity = interaction.options.getNumber('quantity');
		const price = interaction.options.getNumber('price');

		if (assetId === 'kyth') {
			const components = await simpleContainer(
				interaction,
				'## ❌ Unsupported Asset\nLimit orders are **not supported** for the `KYTH` token due to the real-time Automated Market Maker mechanics. Please use `/eco market buy` or `/eco market sell` directly.',
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
			if (side === 'buy') {
				const totalCost = quantity * price;
				if (user.kythiaCoin < totalCost) {
					const msg = await t(
						interaction,
						'economy.market.buy.insufficient.funds.desc',
						{ amount: totalCost.toLocaleString() },
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
					type: 'limit',
					side: 'buy',
					quantity,
					price,
				});

				user.kythiaCoin =
					toBigIntSafe(user.kythiaCoin) - toBigIntSafe(totalCost);

				user.changed('kythiaCoin', true);

				await user.save();

				const msg = await t(
					interaction,
					'economy.market.limit.buy.success.desc',
					{
						quantity,
						asset: assetId.toUpperCase(),
						price: price.toLocaleString(),
						orderId: order.id,
					},
				);
				const components = await simpleContainer(interaction, msg, {
					color: 'Green',
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			} else {
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
					type: 'limit',
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
					'economy.market.limit.sell.success.desc',
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
			}
		} catch (error) {
			logger.error(`Error in limit order: ${error.message || error}`, {
				label: 'economy:market:limit',
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
	},
};
