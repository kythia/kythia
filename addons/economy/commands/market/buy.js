/**
 * @namespace: addons/economy/commands/market/buy.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	MessageFlags,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require('discord.js');
const {
	getMarketData,
	ASSET_IDS,
	KYTH_ASSET_ID,
} = require('../../helpers/market');
const { getStockData, TOP_STOCKS } = require('../../helpers/stock');
const {
	calcBuyOutput,
	getImpactLevel,
	calcMinOut,
} = require('../../helpers/kyth-amm');
const { toBigIntSafe } = require('../../helpers/bigint');

const { BaseCommand } = require('kythia-core');

// Minimum 0.5% slippage tolerance — if pool moves while user is confirming,
// and they'd receive < minOut, we reject the trade.
const { SLIPPAGE_TOLERANCE_PCT } = require('../../helpers/constants');

class BuyCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('buy')
			.setDescription('💸 Buy an asset from the global market.')
			.addStringOption((option) =>
				option
					.setName('asset')
					.setDescription(
						'The symbol of the asset you want to buy (e.g., BTC, ETH, AAPL)',
					)
					.setRequired(true)
					.setAutocomplete(true),
			)
			.addNumberOption((option) =>
				option
					.setName('amount')
					.setDescription('The amount of KythiaCoin you want to spend')
					.setRequired(true)
					.setMinValue(1),
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
		const {
			KythiaUser,
			MarketPortfolio,
			MarketTransaction,
			KythLiquidityPool,
		} = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const assetId = interaction.options.getString('asset');
		const amountToSpend = interaction.options.getNumber('amount');

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

		const userCoin =
			typeof user.kythiaCoin === 'bigint'
				? Number(user.kythiaCoin)
				: Number(user.kythiaCoin);
		if (userCoin < amountToSpend) {
			const msg = await t(
				interaction,
				'economy.market.buy.insufficient.funds.desc',
				{ amount: amountToSpend.toLocaleString() },
			);
			const components = await simpleContainer(interaction, msg, {
				color: kythiaConfig.bot.color,
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		// ─── KYTH AMM Path ─────────────────────────────────────────────────────
		if (assetId === KYTH_ASSET_ID) {
			// Always noCache — pool changes every transaction
			const pool = await KythLiquidityPool.getCache(
				{ id: 1 },
				{ noCache: true },
			);
			if (!pool) {
				const components = await simpleContainer(
					interaction,
					await t(interaction, 'economy.market.buy.error.amm_unavailable.desc'),
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			// ── Admin: Trading Halt ─────────────────────────────────────────────────
			if (pool.tradingHalted) {
				const components = await simpleContainer(
					interaction,
					await t(interaction, 'economy.market.buy.error.trading_halted.desc'),
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			// ── Admin: Trade Limits ──────────────────────────────────────────────
			const minTrade = Number(pool.minTradeAmount ?? 1);
			const maxTrade = Number(pool.maxTradeAmount ?? 0);
			if (amountToSpend < minTrade) {
				const components = await simpleContainer(
					interaction,
					await t(interaction, 'economy.market.buy.error.below_minimum.desc', {
						minTrade: minTrade.toLocaleString(),
					}),
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			if (maxTrade > 0 && amountToSpend > maxTrade) {
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'economy.market.buy.error.exceeds_maximum.desc',
						{ maxTrade: maxTrade.toLocaleString() },
					),
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			// ── Use dynamic fee from pool config ───────────────────────────────────
			const dynamicFeeRate = Number(pool.feeRatePct ?? 2) / 100;

			const poolSnapshot = {
				coinReserve: Number(pool.coinReserve),
				kythReserve: Number(pool.kythReserve),
				kConstant: Number(pool.kConstant),
				feeRate: dynamicFeeRate, // Admin-controlled via /kyth config fee_rate
			};

			let result;
			try {
				result = calcBuyOutput(amountToSpend, poolSnapshot);
			} catch (_e) {
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'economy.market.buy.error.invalid_parameters.desc',
					),
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			if (result.kythOut <= 0) {
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'economy.market.buy.error.insufficient_liquidity.desc',
					),
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			const minOut = calcMinOut(result.kythOut, SLIPPAGE_TOLERANCE_PCT);
			const impactLevel = getImpactLevel(result.priceImpactPct);
			const impactEmoji = { safe: '🟢', warning: '⚠️', danger: '🚨' }[
				impactLevel
			];

			// ── Trade Preview ──────────────────────────────────────────────────
			const feeCoinAmount = result.coinFee.toLocaleString(undefined, {
				maximumFractionDigits: 2,
			});
			const priceAfter = (
				result.newCoinReserve / result.newKythReserve
			).toFixed(6);

			const previewStr = await t(
				interaction,
				'economy.market.buy.preview.desc',
				{
					amountToSpend: amountToSpend.toLocaleString(),
					feeRate: (result.feeRate * 100).toFixed(1),
					feeCoinAmount,
					kythOut: result.kythOut.toFixed(6),
					midPrice: result.midPrice.toFixed(6),
					executionPrice: result.executionPrice.toFixed(6),
					priceAfter,
					impactEmoji,
					priceImpactPct: result.priceImpactPct.toFixed(2),
					minOut: minOut.toFixed(6),
				},
			);
			const previewLines = previewStr.split('\n');

			let warningNote = '';
			if (impactLevel === 'warning')
				warningNote = await t(
					interaction,
					'economy.market.buy.warning.high_impact',
				);
			else if (impactLevel === 'danger')
				warningNote = await t(
					interaction,
					'economy.market.buy.warning.extreme_impact',
				);

			if (warningNote) previewLines.push(warningNote);

			// Safe trades: execute immediately without confirmation
			if (impactLevel === 'safe') {
				return helpers.economy['kyth-trade'].executeBuyKyth({
					interactionOrI: interaction,
					t,
					user,
					amountToSpend,
					minOut,
					simpleContainer,
					models,
					logger,
				});
			}

			// Warning/Danger: require explicit confirmation
			const row = new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId('kyth_buy_confirm')
					.setLabel('Confirm Purchase')
					.setStyle(
						impactLevel === 'danger' ? ButtonStyle.Danger : ButtonStyle.Primary,
					),
				new ButtonBuilder()
					.setCustomId('kyth_buy_cancel')
					.setLabel('Cancel')
					.setStyle(ButtonStyle.Secondary),
			);

			const components = await simpleContainer(
				interaction,
				previewLines.join('\n'),
				{ color: impactLevel === 'danger' ? 'Red' : 'Yellow' },
			);

			const message = await interaction.editReply({
				components: [...components, row],
				flags: MessageFlags.IsComponentsV2,
			});

			const filter = (i) => i.user.id === interaction.user.id;
			const collector = message.createMessageComponentCollector({
				filter,
				time: 30_000,
				max: 1,
			});

			collector.on('collect', async (i) => {
				if (i.customId === 'kyth_buy_confirm') {
					return helpers.economy['kyth-trade'].executeBuyKyth({
						interactionOrI: i,
						t,
						user,
						amountToSpend,
						minOut,
						simpleContainer,
						models,
						logger,
					});
				}
				const cancelComponents = await simpleContainer(
					i,
					await t(i, 'economy.market.buy.cancel.desc'),
					{ color: kythiaConfig.bot.color },
				);
				await i.update({
					components: cancelComponents,
					flags: MessageFlags.IsComponentsV2,
				});
			});

			collector.on('end', async (collected) => {
				if (collected.size === 0) {
					const components = await simpleContainer(
						interaction,
						await t(interaction, 'economy.market.buy.timeout.desc'),
						{ color: kythiaConfig.bot.color },
					);
					await interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}
			});

			return;
		}

		// ─── Standard CoinGecko & Stock Path ───────────────────────────────────────────
		const isCrypto = ASSET_IDS.includes(assetId);
		let currentPrice;

		if (isCrypto) {
			const marketData = await getMarketData();
			const assetData = marketData[assetId];
			if (!assetData) {
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
			currentPrice = assetData.usd;
		} else {
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
			currentPrice = stockData.price;
		}

		const feeAmount = amountToSpend * 0.02;
		const quantityToBuy = (amountToSpend - feeAmount) / currentPrice;

		try {
			const [holding] = await MarketPortfolio.getOrCreateCache(
				{ userId: interaction.user.id, assetId },
				{ quantity: 0, avgBuyPrice: currentPrice },
			);

			const newTotal = holding.quantity + quantityToBuy;
			holding.avgBuyPrice =
				(holding.quantity * holding.avgBuyPrice +
					quantityToBuy * currentPrice) /
				newTotal;
			holding.quantity = newTotal;
			await holding.save();

			await MarketTransaction.create({
				userId: interaction.user.id,
				assetId,
				type: 'buy',
				quantity: quantityToBuy,
				price: currentPrice,
			});

			user.kythiaCoin =
				toBigIntSafe(user.kythiaCoin) - toBigIntSafe(Math.round(amountToSpend));
			user.changed('kythiaCoin', true);
			await user.save();

			const msg = await t(interaction, 'economy.market.buy.success.desc', {
				quantity: quantityToBuy.toFixed(6),
				asset: assetId.toUpperCase(),
				amount: amountToSpend.toLocaleString(),
			});
			const components = await simpleContainer(interaction, msg, {
				color: 'Green',
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			logger.error(`Error during market buy: ${error.message || error}`, {
				label: 'economy:market:buy',
			});
			const msg = await t(interaction, 'economy.market.buy.error.desc');
			const components = await simpleContainer(interaction, msg, {
				color: kythiaConfig.bot.color,
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}

exports.default = BuyCommand;
