/**
 * @namespace: addons/economy/helpers/orderProcessor.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { toBigIntSafe } = require('./bigint');
const { getMarketData } = require('./market');

async function processOrders(bot) {
	const { models, logger } = bot.container;
	const { KythiaUser, MarketOrder, MarketPortfolio, MarketTransaction } =
		models;

	logger.info(`Processing market orders...`, { label: 'economy' });
	try {
		const marketData = await getMarketData();
		const openOrders = await MarketOrder.getAllCache({ status: 'open' });

		for (const order of openOrders) {
			const assetData = marketData[order.assetId];
			if (!assetData) continue;

			const currentPrice = assetData.usd;
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
