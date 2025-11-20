/**
 * @namespace: addons/economy/helpers/orderProcessor.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { getMarketData } = require('./market');
const cron = require('node-cron');

async function processOrders(bot) {
    const { models, logger } = bot.container;
    const { KythiaUser, MarketOrder, MarketPortfolio, MarketTransaction } = models;

    logger.info(`[Economy] Processing market orders...`);
    try {
        const marketData = await getMarketData();
        const openOrders = await MarketOrder.getAllCache({ status: 'open' });

        for (const order of openOrders) {
            const assetData = marketData[order.assetId];
            if (!assetData) continue;

            const currentPrice = assetData.usd;
            let shouldExecute = false;

            if (order.type === 'limit' && order.side === 'buy' && currentPrice <= order.price) {
                shouldExecute = true;
            } else if (order.type === 'limit' && order.side === 'sell' && currentPrice >= order.price) {
                shouldExecute = true;
            } else if (order.type === 'stoploss' && order.side === 'sell' && currentPrice <= order.price) {
                shouldExecute = true;
            }

            if (shouldExecute) {
                const user = await KythiaUser.getCache({ userId: order.userId });
                if (!user) continue;

                if (order.side === 'buy') {
                    const totalCost = order.quantity * order.price;

                    const portfolio = await MarketPortfolio.getCache({ userId: order.userId, assetId: order.assetId });
                    if (portfolio) {
                        const newQuantity = portfolio.quantity + order.quantity;
                        const newAvgPrice = (portfolio.quantity * portfolio.avgBuyPrice + order.quantity * order.price) / newQuantity;
                        portfolio.quantity = newQuantity;
                        portfolio.avgBuyPrice = newAvgPrice;
                        await portfolio.save();
                    } else {
                        await MarketPortfolio.create({
                            userId: order.userId,
                            assetId: order.assetId,
                            quantity: order.quantity,
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
                    const totalReceived = order.quantity * currentPrice;

                    user.kythiaCoin = BigInt(user.kythiaCoin) + BigInt(totalReceived);

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
        logger.error('Error processing market orders:', error);
    }
}

/**
 * Initialize scheduled market order processing.
 * Mimics the style used in @ai/tasks/dailyGreeter.js.
 * @param {Object} [options] Optional scheduling options (e.g. custom cron, timezone).
 */
function initializeOrderProcessing(bot, options = {}) {
    const kythiaConfig = bot.container.kythiaConfig;
    const schedule = kythiaConfig.addons.economy.orderProcessorSchedule
        ? kythiaConfig.addons.economy.orderProcessorSchedule
        : '*/5 * * * *';

    cron.schedule(
        schedule,
        async () => {
            await processOrders(bot);
        },
        {
            timezone: kythiaConfig.bot.timezone ? kythiaConfig.bot.timezone : undefined,
            ...options,
        }
    );
}

module.exports = { processOrders, initializeOrderProcessing };
