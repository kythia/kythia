/**
 * @namespace: addons/economy/helpers/stock.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance({
	suppressNotices: ['yahooSurvey', 'ripHistorical'],
});
const { renderChartFromData } = require('./chart');

/**
 * Validates if a symbol exists and gets its basic price data.
 * @param {string} symbol
 */
async function getStockData(symbol) {
	try {
		const quote = await yahooFinance.quote(symbol);
		if (!quote) return null;

		return {
			symbol: quote.symbol,
			price: quote.regularMarketPrice,
			changePercent: quote.regularMarketChangePercent,
			currency: quote.currency || 'USD',
			shortName: quote.shortName || quote.longName || quote.symbol,
			marketCap: quote.marketCap,
		};
	} catch (e) {
		return null;
	}
}

/**
 * Gets OHLC historical data for a stock and returns a chart image buffer.
 * @param {Object} config Kythia config
 * @param {string} symbol Stock symbol
 * @param {string|number} days Timeframe in days
 */
async function getStockChartBuffer(config, symbol, days = '7') {
	try {
		const daysNum = parseInt(days) || 7;
		let interval = '1d';

		if (daysNum === 1)
			interval = '15m'; // or '5m'
		else if (daysNum <= 7) interval = '1h';
		else if (daysNum <= 30) interval = '1d';
		else if (daysNum <= 90) interval = '1d';
		else interval = '1wk';

		const period1 = new Date();
		period1.setDate(period1.getDate() - daysNum);

		const chartResult = await yahooFinance.chart(symbol, {
			period1: period1,
			interval: interval,
		});
		const result = chartResult.quotes;

		if (!result || result.length === 0) return null;

		// Format into OHLC format { x, o, h, l, c }
		const dataPoints = result
			.map((p) => ({
				x: p.date.getTime(),
				o: p.open,
				h: p.high,
				l: p.low,
				c: p.close,
			}))
			.filter((p) => p.o != null && p.h != null && p.l != null && p.c != null);

		return await renderChartFromData(config, symbol, dataPoints);
	} catch (e) {
		return null;
	}
}

/**
 * Top popular stocks for the global market view fallback.
 */
const TOP_STOCKS = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'GOOG'];

/**
 * Gets a quick summary of top stocks
 */
async function getTopStocksData() {
	try {
		const quotes = await yahooFinance.quote(TOP_STOCKS);
		const data = {};
		for (const quote of quotes) {
			data[quote.symbol] = {
				symbol: quote.symbol,
				price: quote.regularMarketPrice,
				changePercent: quote.regularMarketChangePercent,
			};
		}
		return data;
	} catch (e) {
		return {};
	}
}

module.exports = {
	getStockData,
	getStockChartBuffer,
	getTopStocksData,
	TOP_STOCKS,
};
