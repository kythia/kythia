/**
 * @namespace: addons/economy/commands/market/sell.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	ButtonStyle,
	MessageFlags,
	ButtonBuilder,
	ActionRowBuilder,
} = require('discord.js');
const {
	ASSET_IDS,
	getMarketData,
	KYTH_ASSET_ID,
} = require('../../helpers/market');
const { TOP_STOCKS, getStockData } = require('../../helpers/stock');
const {
	calcMinOut,
	calcSellOutput,
	getImpactLevel,
} = require('../../helpers/kythAmm');
const { toBigIntSafe } = require('../../helpers/bigint');
const { BaseCommand } = require('kythia-core');
const { SLIPPAGE_TOLERANCE_PCT } = require('../../helpers/constants');
const kythtradeHelper = require('../../helpers/kythTrade');
class SellCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('sell')
			.setDescription('Sell an asset to the global market.')
			.addStringOption((option) =>
				option
					.setName('asset')
					.setDescription(
						'The symbol of the asset you want to sell (e.g., BTC, ETH, AAPL)',
					)
					.setRequired(true)
					.setAutocomplete(true),
			)
			.addNumberOption((option) =>
				option
					.setName('quantity')
					.setDescription(
						'The amount of the asset you want to sell (e.g., 0.5 KYTH)',
					)
					.setRequired(true)
					.setMinValue(0.000001),
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
			filtered.slice(0, 25).map((choice) => ({
				name: choice,
				value: choice.toLowerCase(),
			})),
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
		const { simpleContainer, createContainer } = helpers.discord;
		await interaction.deferReply();
		const assetId = interaction.options.getString('asset');
		const sellQuantity = interaction.options.getNumber('quantity');
		const user = await KythiaUser.getCache({
			userId: interaction.user.id,
		});
		if (!user) {
			const msg = await t(
				interaction,
				'economy.shared.withdraw.no.account.desc',
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
			const userKyth = Number(user.kythHolding) || 0;
			if (userKyth < sellQuantity) {
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'economy.commands.market.sell.insufficient_kyth_md',
						{
							userKyth: userKyth.toFixed(6),
							sellQuantity: sellQuantity.toFixed(6),
						},
					),
					{
						color: 'Red',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			const pool = await KythLiquidityPool.getCache(
				{
					id: 1,
				},
				{
					noCache: true,
				},
			);
			if (!pool) {
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'economy.commands.market.sell.amm_unavailable_md',
					),
					{
						color: 'Red',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			// ── Admin: Trading Halt ──────────────────────────────────────────────
			if (pool.tradingHalted) {
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'economy.commands.market.sell.error.trading_halted.desc',
					),
					{
						color: 'Red',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			const poolSnapshot = {
				coinReserve: Number(pool.coinReserve),
				kythReserve: Number(pool.kythReserve),
				kConstant: Number(pool.kConstant),
				feeRate: Number(pool.feeRatePct ?? 2) / 100, // Admin-controlled
			};
			let result;
			try {
				result = calcSellOutput(sellQuantity, poolSnapshot);
			} catch (_e) {
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'economy.commands.market.sell.error.invalid_parameters.desc',
					),
					{
						color: 'Red',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			if (result.coinOut <= 0) {
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'economy.commands.market.sell.insufficient_liquidity_md',
					),
					{
						color: 'Red',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			// For sells, slippage means we want at least minOut Coin
			const minCoinOut = calcMinOut(result.coinOut, SLIPPAGE_TOLERANCE_PCT);
			const impactLevel = getImpactLevel(result.priceImpactPct); // negative for sells
			const impactEmoji = {
				safe: '🟢',
				warning: '⚠️',
				danger: '🚨',
			}[impactLevel];
			const kythFeeAmt = result.kythFee.toFixed(6);
			const priceAfter = (
				result.newCoinReserve / result.newKythReserve
			).toFixed(6);
			const previewLines = [
				await t(interaction, 'economy.commands.market.sell.preview_title'),
				``,
				`**You Sell:**  💎 ${sellQuantity.toFixed(6)} KYTH`,
				`**Protocol Fee (${(result.feeRate * 100).toFixed(1)}%):**  💎 ${kythFeeAmt} KYTH`,
				`**You Receive:** 🪙 ${result.coinOut.toLocaleString(undefined, {
					maximumFractionDigits: 2,
				})} Coin`,
				``,
				`**Mid Price:** ${result.midPrice.toFixed(6)} Coin/KYTH`,
				`**Execution Price:** ${result.executionPrice.toFixed(6)} Coin/KYTH`,
				`**Price After:** ${priceAfter} Coin/KYTH`,
				`${impactEmoji} **Price Impact:** ${result.priceImpactPct.toFixed(2)}%`,
				`**Min. Received:** 🪙 ${minCoinOut.toLocaleString(undefined, {
					maximumFractionDigits: 2,
				})} (0.5% slippage tol.)`,
			];
			let warningNote = '';
			if (impactLevel === 'warning')
				warningNote = await t(
					interaction,
					'economy.commands.market.sell.warning.high_impact',
				);
			else if (impactLevel === 'danger')
				warningNote = await t(
					interaction,
					'economy.commands.market.sell.warning.extreme_impact',
				);
			if (warningNote) previewLines.push('', warningNote);
			if (impactLevel === 'safe') {
				return kythtradeHelper.executeSellKyth({
					interactionOrI: interaction,
					t,
					user,
					sellQuantity,
					minCoinOut,
					simpleContainer,
					models,
					logger,
				});
			}
			const row = new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId('kyth_sell_confirm')
					.setLabel(
						await interaction.client.container.t(
							interaction,
							'economy.ui.confirm_sell',
						),
					)
					.setStyle(
						impactLevel === 'danger' ? ButtonStyle.Danger : ButtonStyle.Primary,
					),
				new ButtonBuilder()
					.setCustomId('kyth_sell_cancel')
					.setLabel('Cancel')
					.setStyle(ButtonStyle.Secondary),
			);
			const components = await createContainer(interaction, {
				description: previewLines.join('\n'),
				color: impactLevel === 'danger' ? 'Red' : 'Yellow',
				components: [row],
			});
			const message = await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
			const filter = (i) => i.user.id === interaction.user.id;
			const collector = message.createMessageComponentCollector({
				filter,
				time: 30_000,
				max: 1,
			});
			collector.on('collect', async (i) => {
				if (i.customId === 'kyth_sell_confirm') {
					return kythtradeHelper.executeSellKyth({
						interactionOrI: i,
						t,
						user,
						sellQuantity,
						minCoinOut,
						simpleContainer,
						models,
						logger,
					});
				}
				const cancelComponents = await simpleContainer(
					i,
					await t(i, 'economy.commands.market.sell.cancel.desc'),
					{
						color: kythiaConfig.bot.color,
					},
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
						await t(interaction, 'economy.commands.market.sell.timeout.desc'),
						{
							color: kythiaConfig.bot.color,
						},
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
		const holding = await MarketPortfolio.getCache({
			userId: interaction.user.id,
			assetId,
		});
		if (!holding || holding.quantity < sellQuantity) {
			const msg = await t(
				interaction,
				'economy.shared.market.sell.insufficient.asset.desc',
				{
					asset: assetId.toUpperCase(),
				},
			);
			const components = await simpleContainer(interaction, msg, {
				color: kythiaConfig.bot.color,
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const isCrypto = ASSET_IDS.includes(assetId);
		let currentPrice;
		if (isCrypto) {
			const marketData = await getMarketData();
			const assetData = marketData[assetId];
			if (!assetData) {
				const msg = await t(
					interaction,
					'economy.shared.market.sell.asset.not.found.desc',
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
					'economy.shared.market.sell.asset.not.found.desc',
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
		const grossReceived = sellQuantity * currentPrice;
		const feeAmount = grossReceived * 0.02;
		const totalReceived = grossReceived - feeAmount;
		try {
			const avgBuyPrice = holding.avgBuyPrice;
			const newQuantity = holding.quantity - sellQuantity;
			if (newQuantity > 1e-9) {
				holding.quantity = newQuantity;
				await holding.save();
			} else {
				await holding.destroy();
			}
			await MarketTransaction.create({
				userId: interaction.user.id,
				assetId,
				type: 'sell',
				quantity: sellQuantity,
				price: currentPrice,
			});
			user.kythiaCoin =
				toBigIntSafe(user.kythiaCoin) + toBigIntSafe(Math.round(totalReceived));
			user.changed('kythiaCoin', true);
			await user.save();
			const pnl = (currentPrice - avgBuyPrice) * sellQuantity;
			const pnlSign = pnl >= 0 ? '+' : '';
			const pnlEmoji = pnl >= 0 ? '📈' : '📉';
			const msg = await t(
				interaction,
				'economy.commands.market.sell.success.desc',
				{
					quantity: sellQuantity.toFixed(6),
					asset: assetId.toUpperCase(),
					amount: totalReceived.toLocaleString(undefined, {
						maximumFractionDigits: 2,
					}),
					avgBuyPrice: avgBuyPrice.toLocaleString(undefined, {
						maximumFractionDigits: 2,
					}),
					sellPrice: currentPrice.toLocaleString(undefined, {
						maximumFractionDigits: 2,
					}),
					pnlEmoji,
					pnlSign,
					pnl: pnl.toLocaleString(undefined, {
						maximumFractionDigits: 2,
					}),
				},
			);
			const components = await simpleContainer(interaction, msg, {
				color: 'Yellow',
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			logger.error(`Error during market sell: ${error.message || error}`, {
				label: 'economy:market:sell',
			});
			const msg = await t(
				interaction,
				'economy.commands.market.sell.error.desc',
			);
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
exports.default = SellCommand;
