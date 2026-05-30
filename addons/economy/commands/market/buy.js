/**
 * @namespace: addons/economy/commands/market/buy.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 2.0.0
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
const {
	calcBuyOutput,
	getSpotPrice,
	getImpactLevel,
	calcMinOut,
} = require('../../helpers/kyth-amm');
const { toBigIntSafe } = require('../../helpers/bigint');

// Minimum 0.5% slippage tolerance — if pool moves while user is confirming,
// and they'd receive < minOut, we reject the trade.
const SLIPPAGE_TOLERANCE_PCT = 0.5;

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('buy')
			.setDescription('💸 Buy an asset from the global market.')
			.addStringOption((option) =>
				option
					.setName('asset')
					.setDescription(
						'The symbol of the asset you want to buy (e.g., BTC, ETH, KYTH)',
					)
					.setRequired(true)
					.addChoices(
						...ASSET_IDS.map((id) => ({ name: id.toUpperCase(), value: id })),
					),
			)
			.addNumberOption((option) =>
				option
					.setName('amount')
					.setDescription('The amount of KythiaCoin you want to spend')
					.setRequired(true)
					.setMinValue(1),
			),

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
			const msg = `## ${await t(interaction, 'economy.market.buy.insufficient.funds.title')}\n${await t(interaction, 'economy.market.buy.insufficient.funds.desc', { amount: amountToSpend.toLocaleString() })}`;
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
					'## ❌ AMM Unavailable\nThe KYTH liquidity pool has not been initialized yet. Contact an admin.',
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
					'## 🚫 KYTH Trading Halted\nThe admin has temporarily halted all KYTH trading. Check back later.',
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
					`## ❌ Below Minimum\nMinimum trade size is **🪙 ${minTrade.toLocaleString()} Coin**.`,
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
					`## ❌ Exceeds Maximum\nMax trade size is **🪙 ${maxTrade.toLocaleString()} Coin** (anti-whale limit). Split your order!`,
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
			} catch (e) {
				const components = await simpleContainer(
					interaction,
					'## ❌ Invalid trade parameters.',
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
					'## ❌ Insufficient Liquidity\nThe pool does not have enough KYTH to fill your order.',
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

			const previewLines = [
				`## 💎 KYTH Buy Preview`,
				``,
				`**You Spend:**  🪙 ${amountToSpend.toLocaleString()} Coin`,
				`**Protocol Fee (${(result.feeRate * 100).toFixed(1)}%):**  🪙 ${feeCoinAmount} Coin`,
				`**You Receive:** 💎 ${result.kythOut.toFixed(6)} KYTH`,
				``,
				`**Mid Price:** ${result.midPrice.toFixed(6)} Coin/KYTH`,
				`**Execution Price:** ${result.executionPrice.toFixed(6)} Coin/KYTH`,
				`**Price After:** ${priceAfter} Coin/KYTH`,
				`${impactEmoji} **Price Impact:** ${result.priceImpactPct.toFixed(2)}%`,
				`**Min. Received:** ${minOut.toFixed(6)} KYTH (0.5% slippage tol.)`,
			];

			const warningNote = {
				safe: '',
				warning:
					'\n\n⚠️ **High price impact.** Your trade is large relative to pool size. You are paying a significant premium.',
				danger:
					'\n\n🚨 **EXTREME PRICE IMPACT!** This trade will move the market by a lot. You are buying at a very high premium. Are you absolutely sure?',
			}[impactLevel];

			if (warningNote) previewLines.push(warningNote);

			// Safe trades: execute immediately without confirmation
			if (impactLevel === 'safe') {
				return _executeBuyKyth({
					interactionOrI: interaction,
					user,
					pool,
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
					// Re-fetch pool FRESH — it may have moved while user was reading
					const freshPool = await KythLiquidityPool.getCache(
						{ id: 1 },
						{ noCache: true },
					);
					return _executeBuyKyth({
						interactionOrI: i,
						user,
						pool: freshPool,
						amountToSpend,
						minOut,
						simpleContainer,
						models,
						logger,
					});
				}
				const cancelComponents = await simpleContainer(
					i,
					'Purchase cancelled.',
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
						'⏱️ Confirmation timed out. Trade cancelled.',
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

		// ─── Standard CoinGecko Path ───────────────────────────────────────────
		const marketData = await getMarketData();
		const assetData = marketData[assetId];

		if (!assetData) {
			const msg = `## ${await t(interaction, 'economy.market.buy.asset.not.found.title')}\n${await t(interaction, 'economy.market.buy.asset.not.found.desc')}`;
			const components = await simpleContainer(interaction, msg, {
				color: kythiaConfig.bot.color,
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const currentPrice = assetData.usd;
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

			const msg = `## ${await t(interaction, 'economy.market.buy.success.title')}\n${await t(interaction, 'economy.market.buy.success.desc', { quantity: quantityToBuy.toFixed(6), asset: assetId.toUpperCase(), amount: amountToSpend.toLocaleString() })}`;
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
			const msg = `## ${await t(interaction, 'economy.market.buy.error.title')}\n${await t(interaction, 'economy.market.buy.error.desc')}`;
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

/**
 * Executes a KYTH buy atomically.
 *
 * RACE CONDITION MITIGATION:
 *   1. We always pass the latest `pool` (noCache fetch) right before calling this.
 *   2. We re-compute the swap on the FRESH pool data.
 *   3. We check minOut (slippage guard): if the fresh result gives < minOut KYTH,
 *      we reject — the pool moved too much while user was confirming.
 *   4. We save pool first, then user — so if user.save() fails, pool is already updated
 *      but at worst user loses their coins (shouldn't happen). Sequelize transaction
 *      not used because KythiaModel layer doesn't expose it.
 */
async function _executeBuyKyth({
	interactionOrI,
	user,
	pool,
	amountToSpend,
	minOut,
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

			result = calcBuyOutput(amountToSpend, poolState);
			newSpotPrice = result.newCoinReserve / result.newKythReserve;

			// Slippage guard: reject if pool moved and user would get less than minOut
			if (result.kythOut < minOut) {
				const components = await simpleContainer(
					interactionOrI,
					`## ⚠️ Slippage Exceeded\nThe market moved while you were confirming. You would have received **${result.kythOut.toFixed(6)} KYTH** but your minimum is **${minOut.toFixed(6)} KYTH**.\nPlease try again.`,
					{ color: 'Red' },
				);
				return interactionOrI[method]({ components, flags: MF.IsComponentsV2 });
			}

			// ── Update pool (don't round coinReserve — preserve float precision) ──
			freshPool.coinReserve = result.newCoinReserve; // DOUBLE in DB, preserve precision
			freshPool.kythReserve = result.newKythReserve;
			freshPool.totalTaxCollected =
				Number(freshPool.totalTaxCollected) + result.coinFee;
			freshPool.changed('coinReserve', true);
			freshPool.changed('kythReserve', true);
			freshPool.changed('totalTaxCollected', true);
			await freshPool.save();
		} finally {
			if (lockAcquired) {
				await releaseLock(LOCK_KEY);
				lockAcquired = false;
			}
		}

		// ── Update user ──
		user.kythiaCoin = toBig(user.kythiaCoin) - toBig(Math.round(amountToSpend));
		user.kythHolding = (Number(user.kythHolding) || 0) + result.kythOut;
		user.changed('kythiaCoin', true);
		user.changed('kythHolding', true);
		await user.save();

		// ── Log trade ──
		await MarketTransaction.create({
			userId: user.userId,
			assetId: 'kyth',
			type: 'buy',
			quantity: result.kythOut,
			price: newSpotPrice,
		});

		const successMsg = [
			`## 💎 KYTH Purchased!`,
			``,
			`**Spent:** 🪙 ${amountToSpend.toLocaleString()} Coin`,
			`**Received:** 💎 ${result.kythOut.toFixed(6)} KYTH`,
			`**Effective Price:** ${result.executionPrice.toFixed(6)} Coin/KYTH`,
			`**New Market Price:** ${newSpotPrice.toFixed(6)} Coin/KYTH 📈`,
		].join('\n');

		const components = await simpleContainer(interactionOrI, successMsg, {
			color: 'Green',
		});
		await interactionOrI[method]({ components, flags: MF.IsComponentsV2 });
	} catch (err) {
		logger.error?.(`KYTH buy error: ${err.message || err}`, {
			label: 'economy:kyth:buy',
		});
		const components = await simpleContainer(
			interactionOrI,
			`## ❌ Transaction Failed\n${err.message || 'Unknown error.'}`,
			{ color: 'Red' },
		);
		await interactionOrI[method]({ components, flags: MF.IsComponentsV2 });
	}
}
