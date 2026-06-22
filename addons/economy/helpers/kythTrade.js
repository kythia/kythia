/**
 * @namespace: addons/economy/helpers/kythTrade.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { toBigIntSafe } = require('./bigint');
const { calcBuyOutput, calcSellOutput } = require('./kythAmm');
const { waitAndAcquireLock, releaseLock } = require('./lock');
const LOCK_KEY = 'kythia:locks:amm_pool';

/**
 * Executes a KYTH buy atomically.
 */
async function executeBuyKyth({
	interactionOrI,
	t,
	user,
	amountToSpend,
	minOut,
	simpleContainer,
	models,
	logger,
}) {
	const { KythLiquidityPool, MarketTransaction } = models;
	const method =
		interactionOrI.deferred || interactionOrI.replied ? 'editReply' : 'update';
	try {
		let lockAcquired = false;
		let result;
		let newSpotPrice;
		try {
			await waitAndAcquireLock(LOCK_KEY);
			lockAcquired = true;

			// Fetch fresh pool state from DB after lock is acquired
			const freshPool = await KythLiquidityPool.getCache(
				{
					id: 1,
				},
				{
					noCache: true,
				},
			);
			const poolState = {
				coinReserve: Number(freshPool.coinReserve),
				kythReserve: Number(freshPool.kythReserve),
				kConstant: Number(freshPool.kConstant),
				feeRate: Number(freshPool.feeRatePct ?? 2) / 100,
			};
			result = calcBuyOutput(amountToSpend, poolState);
			newSpotPrice = result.newCoinReserve / result.newKythReserve;

			// Slippage guard
			if (result.kythOut < minOut) {
				const components = await simpleContainer(
					interactionOrI,
					await t(
						interactionOrI,
						'economy.helpers.kythTrade.market.buy.error.slippage.desc',
						{
							received: result.kythOut.toFixed(6),
							minOut: minOut.toFixed(6),
						},
					),
					{
						color: 'Red',
					},
				);
				return interactionOrI[method]({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			// Update pool
			freshPool.coinReserve = result.newCoinReserve;
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
			}
		}

		// Update user
		user.kythiaCoin =
			toBigIntSafe(user.kythiaCoin) - toBigIntSafe(Math.round(amountToSpend));
		user.kythHolding = (Number(user.kythHolding) || 0) + result.kythOut;
		user.changed('kythiaCoin', true);
		user.changed('kythHolding', true);
		await user.save();

		// Log trade
		await MarketTransaction.create({
			userId: user.userId,
			assetId: 'kyth',
			type: 'buy',
			quantity: result.kythOut,
			price: newSpotPrice,
		});
		const successMsg = [
			await t(interactionOrI, 'economy.helpers.kythTrade.trade.buy_success'),
			``,
			`**Spent:** 🪙 ${amountToSpend.toLocaleString()} Coin`,
			`**Received:** 💎 ${result.kythOut.toFixed(6)} KYTH`,
			`**Effective Price:** ${result.executionPrice.toFixed(6)} Coin/KYTH`,
			`**New Market Price:** ${newSpotPrice.toFixed(6)} Coin/KYTH 📈`,
		].join('\n');
		const components = await simpleContainer(interactionOrI, successMsg, {
			color: 'Green',
		});
		await interactionOrI[method]({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	} catch (err) {
		logger.error?.(`KYTH buy error: ${err.message || err}`, {
			label: 'economy:kyth:buy',
		});
		const components = await simpleContainer(
			interactionOrI,
			await t(interactionOrI, 'economy.shared.trade.fail', {
				err: err.message || 'Unknown error.',
			}),
			{
				color: 'Red',
			},
		);
		await interactionOrI[method]({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

/**
 * Executes a KYTH sell atomically.
 */
async function executeSellKyth({
	interactionOrI,
	t,
	user,
	sellQuantity,
	minCoinOut,
	simpleContainer,
	models,
	logger,
}) {
	const { KythLiquidityPool, MarketTransaction } = models;
	const method =
		interactionOrI.deferred || interactionOrI.replied ? 'editReply' : 'update';
	try {
		let lockAcquired = false;
		let result;
		let newSpotPrice;
		try {
			await waitAndAcquireLock(LOCK_KEY);
			lockAcquired = true;

			// Fetch fresh pool state from DB after lock is acquired
			const freshPool = await KythLiquidityPool.getCache(
				{
					id: 1,
				},
				{
					noCache: true,
				},
			);
			const poolState = {
				coinReserve: Number(freshPool.coinReserve),
				kythReserve: Number(freshPool.kythReserve),
				kConstant: Number(freshPool.kConstant),
				feeRate: Number(freshPool.feeRatePct ?? 2) / 100,
			};
			result = calcSellOutput(sellQuantity, poolState);
			newSpotPrice = result.newCoinReserve / result.newKythReserve;

			// Slippage guard
			if (result.coinOut < minCoinOut) {
				const components = await simpleContainer(
					interactionOrI,
					await t(
						interactionOrI,
						'economy.helpers.kythTrade.market.sell.error.slippage.desc',
						{
							received: result.coinOut.toLocaleString(undefined, {
								maximumFractionDigits: 2,
							}),
							minOut: minCoinOut.toLocaleString(undefined, {
								maximumFractionDigits: 2,
							}),
						},
					),
					{
						color: 'Red',
					},
				);
				return interactionOrI[method]({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			// Update pool
			freshPool.coinReserve = result.newCoinReserve;
			freshPool.kythReserve = result.newKythReserve;
			freshPool.changed('coinReserve', true);
			freshPool.changed('kythReserve', true);
			await freshPool.save();
		} finally {
			if (lockAcquired) {
				await releaseLock(LOCK_KEY);
			}
		}

		// Update user
		user.kythHolding = Math.max(
			0,
			(Number(user.kythHolding) || 0) - sellQuantity,
		);
		user.kythiaCoin =
			toBigIntSafe(user.kythiaCoin) + toBigIntSafe(Math.round(result.coinOut));
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
			await t(interactionOrI, 'economy.helpers.kythTrade.trade.sell_success'),
			``,
			`**Sold:** 💎 ${sellQuantity.toFixed(6)} KYTH`,
			`**Received:** 🪙 ${result.coinOut.toLocaleString(undefined, {
				maximumFractionDigits: 2,
			})} Coin`,
			`**Effective Price:** ${result.executionPrice.toFixed(6)} Coin/KYTH`,
			`**New Market Price:** ${newSpotPrice.toFixed(6)} Coin/KYTH 📉`,
		].join('\n');
		const components = await simpleContainer(interactionOrI, successMsg, {
			color: 'Yellow',
		});
		await interactionOrI[method]({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	} catch (err) {
		logger.error?.(`KYTH sell error: ${err.message || err}`, {
			label: 'economy:kyth:sell',
		});
		const components = await simpleContainer(
			interactionOrI,
			await t(interactionOrI, 'economy.shared.trade.fail', {
				err: err.message || 'Unknown error.',
			}),
			{
				color: 'Red',
			},
		);
		await interactionOrI[method]({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
module.exports = {
	executeBuyKyth,
	executeSellKyth,
};
