/**
 * @namespace: addons/economy/commands/market/sell.js
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
	calcSellOutput,
	getImpactLevel,
	calcMinOut,
} = require('../../helpers/kyth-amm');
const { toBigIntSafe } = require('../../helpers/bigint');

const SLIPPAGE_TOLERANCE_PCT = 0.5;

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('sell')
			.setDescription('💰 Sell an asset to the global market.')
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
		const {
			KythiaUser,
			MarketPortfolio,
			MarketTransaction,
			KythLiquidityPool,
		} = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const assetId = interaction.options.getString('asset');
		const sellQuantity = interaction.options.getNumber('quantity');

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

		// ─── KYTH AMM Path ─────────────────────────────────────────────────────
		if (assetId === KYTH_ASSET_ID) {
			const userKyth = Number(user.kythHolding) || 0;
			if (userKyth < sellQuantity) {
				const components = await simpleContainer(
					interaction,
					`## ❌ Insufficient KYTH\nYou only have **${userKyth.toFixed(6)} KYTH**. Cannot sell **${sellQuantity.toFixed(6)} KYTH**.`,
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			const pool = await KythLiquidityPool.getCache(
				{ id: 1 },
				{ noCache: true },
			);
			if (!pool) {
				const components = await simpleContainer(
					interaction,
					'## ❌ AMM Unavailable\nThe KYTH liquidity pool is not initialized.',
					{ color: 'Red' },
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
					await t(interaction, 'economy.market.sell.error.trading_halted.desc'),
					{ color: 'Red' },
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
						'economy.market.sell.error.invalid_parameters.desc',
					),
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			if (result.coinOut <= 0) {
				const components = await simpleContainer(
					interaction,
					'## ❌ Insufficient Pool Liquidity\nThe pool does not have enough Coin to fill your sell order.',
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			// For sells, slippage means we want at least minOut Coin
			const minCoinOut = calcMinOut(result.coinOut, SLIPPAGE_TOLERANCE_PCT);
			const impactLevel = getImpactLevel(result.priceImpactPct); // negative for sells
			const impactEmoji = { safe: '🟢', warning: '⚠️', danger: '🚨' }[
				impactLevel
			];

			const kythFeeAmt = result.kythFee.toFixed(6);
			const priceAfter = (
				result.newCoinReserve / result.newKythReserve
			).toFixed(6);

			const previewLines = [
				`## 💰 KYTH Sell Preview`,
				``,
				`**You Sell:**  💎 ${sellQuantity.toFixed(6)} KYTH`,
				`**Protocol Fee (${(result.feeRate * 100).toFixed(1)}%):**  💎 ${kythFeeAmt} KYTH`,
				`**You Receive:** 🪙 ${result.coinOut.toLocaleString(undefined, { maximumFractionDigits: 2 })} Coin`,
				``,
				`**Mid Price:** ${result.midPrice.toFixed(6)} Coin/KYTH`,
				`**Execution Price:** ${result.executionPrice.toFixed(6)} Coin/KYTH`,
				`**Price After:** ${priceAfter} Coin/KYTH`,
				`${impactEmoji} **Price Impact:** ${result.priceImpactPct.toFixed(2)}%`,
				`**Min. Received:** 🪙 ${minCoinOut.toLocaleString(undefined, { maximumFractionDigits: 2 })} (0.5% slippage tol.)`,
			];

			const warningNote = {
				safe: '',
				warning:
					'\n\n⚠️ **High price impact.** Your sell will noticeably push the price down.',
				danger:
					'\n\n🚨 **EXTREME DUMP WARNING!** This sell will crash the KYTH price significantly. Are you sure?',
			}[impactLevel];
			if (warningNote) previewLines.push(warningNote);

			if (impactLevel === 'safe') {
				return _executeSellKyth({
					interactionOrI: interaction,
					t,
					user,
					pool,
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
					.setLabel('Confirm Sell')
					.setStyle(
						impactLevel === 'danger' ? ButtonStyle.Danger : ButtonStyle.Primary,
					),
				new ButtonBuilder()
					.setCustomId('kyth_sell_cancel')
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
				if (i.customId === 'kyth_sell_confirm') {
					const freshPool = await KythLiquidityPool.getCache(
						{ id: 1 },
						{ noCache: true },
					);
					return _executeSellKyth({
						interactionOrI: i,
						t,
						user,
						pool: freshPool,
						sellQuantity,
						minCoinOut,
						simpleContainer,
						models,
						logger,
					});
				}
				const cancelComponents = await simpleContainer(
					i,
					await t(i, 'economy.market.sell.cancel.desc'),
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
						await t(interaction, 'economy.market.sell.timeout.desc'),
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
		const holding = await MarketPortfolio.getCache({
			userId: interaction.user.id,
			assetId,
		});

		if (!holding || holding.quantity < sellQuantity) {
			const msg = await t(
				interaction,
				'economy.market.sell.insufficient.asset.desc',
				{ asset: assetId.toUpperCase() },
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
					'economy.market.sell.asset.not.found.desc',
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
					'economy.market.sell.asset.not.found.desc',
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

			const msg = `## ${await t(interaction, 'economy.market.sell.success.title')}\n${await t(
				interaction,
				'economy.market.sell.success.desc',
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
					pnl: pnl.toLocaleString(undefined, { maximumFractionDigits: 2 }),
				},
			)}`;
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
			const msg = await t(interaction, 'economy.market.sell.error.desc');
			const components = await simpleContainer(interaction, msg, {
				color: kythiaConfig.bot.color,
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	},
};

async function _executeSellKyth({
	interactionOrI,
	t,
	user,
	_pool,
	sellQuantity,
	minCoinOut,
	simpleContainer,
	models,
	logger,
}) {
	const { KythLiquidityPool, MarketTransaction } = models;
	const { MessageFlags: MF } = require('discord.js');
	const { toBigIntSafe: toBig } = require('../../helpers/bigint');

	const method =
		interactionOrI.deferred || interactionOrI.replied ? 'editReply' : 'update';

	const { waitAndAcquireLock, releaseLock } = require('../../helpers/lock');
	const LOCK_KEY = 'kythia:locks:amm_pool';
	try {
		let lockAcquired = false;
		let result;
		let newSpotPrice;

		try {
			await waitAndAcquireLock(LOCK_KEY);
			lockAcquired = true;

			// Fetch fresh pool state from DB after lock is acquired to prevent race conditions
			const freshPool = await KythLiquidityPool.getCache(
				{ id: 1 },
				{ noCache: true },
			);

			const poolState = {
				coinReserve: Number(freshPool.coinReserve),
				kythReserve: Number(freshPool.kythReserve),
				kConstant: Number(freshPool.kConstant),
				feeRate: Number(freshPool.feeRatePct ?? 2) / 100, // Admin-controlled
			};

			result = calcSellOutput(sellQuantity, poolState);
			newSpotPrice = result.newCoinReserve / result.newKythReserve;

			// Slippage guard
			if (result.coinOut < minCoinOut) {
				const components = await simpleContainer(
					interactionOrI,
					await t(interactionOrI, 'economy.market.sell.error.slippage.desc', {
						received: result.coinOut.toLocaleString(undefined, {
							maximumFractionDigits: 2,
						}),
						minOut: minCoinOut.toLocaleString(undefined, {
							maximumFractionDigits: 2,
						}),
					}),
					{ color: 'Red' },
				);
				return interactionOrI[method]({ components, flags: MF.IsComponentsV2 });
			}

			// Update pool — preserve float precision, no Math.round()
			freshPool.coinReserve = result.newCoinReserve;
			freshPool.kythReserve = result.newKythReserve;
			freshPool.changed('coinReserve', true);
			freshPool.changed('kythReserve', true);
			await freshPool.save();
		} finally {
			if (lockAcquired) {
				await releaseLock(LOCK_KEY);
				lockAcquired = false;
			}
		}

		// Update user
		user.kythHolding = Math.max(
			0,
			(Number(user.kythHolding) || 0) - sellQuantity,
		);
		user.kythiaCoin =
			toBig(user.kythiaCoin) + toBig(Math.round(result.coinOut));
		user.changed('kythHolding', true);
		user.changed('kythiaCoin', true);
		await user.save();

		await MarketTransaction.create({
			userId: user.userId,
			assetId: 'kyth',
			type: 'sell',
			quantity: sellQuantity,
			price: newSpotPrice,
		});

		const successMsg = [
			`## 💰 KYTH Sold!`,
			``,
			`**Sold:** 💎 ${sellQuantity.toFixed(6)} KYTH`,
			`**Received:** 🪙 ${result.coinOut.toLocaleString(undefined, { maximumFractionDigits: 2 })} Coin`,
			`**Effective Price:** ${result.executionPrice.toFixed(6)} Coin/KYTH`,
			`**New Market Price:** ${newSpotPrice.toFixed(6)} Coin/KYTH 📉`,
		].join('\n');

		const components = await simpleContainer(interactionOrI, successMsg, {
			color: 'Yellow',
		});
		await interactionOrI[method]({ components, flags: MF.IsComponentsV2 });
	} catch (err) {
		logger.error?.(`KYTH sell error: ${err.message || err}`, {
			label: 'economy:kyth:sell',
		});
		const components = await simpleContainer(
			interactionOrI,
			`## ❌ Transaction Failed\n${err.message || 'Unknown error.'}`,
			{ color: 'Red' },
		);
		await interactionOrI[method]({ components, flags: MF.IsComponentsV2 });
	}
}
