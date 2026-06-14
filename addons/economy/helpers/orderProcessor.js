/**
 * @namespace: addons/economy/helpers/orderProcessor.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { toBigIntSafe } = require('./bigint');
const { getMarketData, ASSET_IDS } = require('./market');
const { getStockData } = require('./stock');
const { getSpotPrice } = require('./kythAmm');

async function processOrders(bot) {
	const { models, logger } = bot.container;
	const { KythiaUser, MarketOrder, MarketPortfolio, MarketTransaction } =
		models;

	logger.info(`Processing market orders...`, { label: 'economy' });
	try {
		const marketData = (await getMarketData()) || {};
		const openOrders = await MarketOrder.getAllCache({ status: 'open' });

		const pool = await models.KythLiquidityPool.getCache({ id: 1 });
		const kythSpotPrice = pool ? getSpotPrice(pool) : 0;
		marketData.kyth = { usd: kythSpotPrice };

		// Pre-fetch all non-crypto unique stocks to avoid rate limiting or multiple requests
		const stockSymbols = [
			...new Set(
				openOrders
					.filter((o) => !ASSET_IDS.includes(o.assetId))
					.map((o) => o.assetId.toUpperCase()),
			),
		];

		const stocksData = {};
		if (stockSymbols.length > 0) {
			try {
				const { default: yahooFinance } = require('yahoo-finance2');
				const quotes = await yahooFinance.quote(stockSymbols);
				for (const q of quotes) {
					stocksData[q.symbol.toUpperCase()] = q.regularMarketPrice;
				}
			} catch (e) {
				logger.warn(
					`Failed to fetch stock quotes for order processor: ${e.message}`,
					{ label: 'economy' },
				);
			}
		}

		for (const order of openOrders) {
			let currentPrice;
			const isCrypto = ASSET_IDS.includes(order.assetId);

			if (isCrypto) {
				const assetData = marketData[order.assetId];
				if (!assetData) continue;
				currentPrice = assetData.usd;
			} else {
				currentPrice = stocksData[order.assetId.toUpperCase()];
				if (!currentPrice) {
					// Fallback to fetch individually if yahooFinance.quote failed or missed it
					const stockData = await getStockData(order.assetId);
					if (!stockData) continue;
					currentPrice = stockData.price;
					stocksData[order.assetId.toUpperCase()] = currentPrice;
				}
			}
			let shouldExecute = false;

			if (
				order.type === 'limit' &&
				order.side === 'buy' &&
				currentPrice <= order.price
			) {
				shouldExecute = true;
			} else if (
				order.type === 'limit' &&
				order.side === 'sell' &&
				currentPrice >= order.price
			) {
				shouldExecute = true;
			} else if (
				order.type === 'stoploss' &&
				order.side === 'sell' &&
				currentPrice <= order.price
			) {
				shouldExecute = true;
			}

			if (shouldExecute) {
				const user = await KythiaUser.getCache({ userId: order.userId });
				if (!user) continue;

				if (order.side === 'buy') {
					const _totalCost = order.quantity * order.price;
					const quantityBought = order.quantity * 0.98; // 2% fee

					const portfolio = await MarketPortfolio.getCache({
						userId: order.userId,
						assetId: order.assetId,
					});
					if (portfolio) {
						const newQuantity = portfolio.quantity + quantityBought;
						const newAvgPrice =
							(portfolio.quantity * portfolio.avgBuyPrice +
								quantityBought * order.price) /
							newQuantity;
						portfolio.quantity = newQuantity;
						portfolio.avgBuyPrice = newAvgPrice;
						await portfolio.save();
					} else {
						await MarketPortfolio.create({
							userId: order.userId,
							assetId: order.assetId,
							quantity: quantityBought,
							avgBuyPrice: order.price,
						});
					}

					order.status = 'filled';
					await MarketTransaction.create({
						userId: order.userId,
						assetId: order.assetId,
						type: 'buy',
						quantity: order.quantity,
						price: order.price,
					});
				} else {
					const grossReceived = order.quantity * currentPrice;
					const feeAmount = grossReceived * 0.02; // 2% fee
					const totalReceived = grossReceived - feeAmount;

					user.kythiaCoin =
						toBigIntSafe(user.kythiaCoin) + toBigIntSafe(totalReceived);

					user.changed('kythiaCoin', true);

					order.status = 'filled';
					await MarketTransaction.create({
						userId: order.userId,
						assetId: order.assetId,
						type: 'sell',
						quantity: order.quantity,
						price: currentPrice,
					});
				}

				await user.save();
				await order.save();
			}
		}
	} catch (error) {
		logger.error(`Error processing market orders: ${error.message || error}`, {
			label: 'economy',
		});
	}
}

module.exports = { processOrders };
