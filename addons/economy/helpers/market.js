/**
 * @namespace: addons/economy/helpers/market.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const axios = require('axios');
const { renderChartFromData } = require('./chart');

let marketCache = {
	data: null,
	timestamp: 0,
};

const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

const ASSET_IDS = [
	'kyth',
	'bitcoin',
	'ethereum',
	'solana',
	'dogecoin',
	'monero',
	'tether',
	'binancecoin',
	'ripple',
	'pax-gold',
];

async function getMarketData() {
	const now = Date.now();
	if (marketCache.data && now - marketCache.timestamp < CACHE_DURATION_MS) {
		return marketCache.data;
	}
	try {
		const response = await axios.get(
			'https://api.coingecko.com/api/v3/simple/price',
			{
				params: {
					ids: ASSET_IDS.join(','),
					vs_currencies: 'usd',
					include_24hr_change: 'true',
				},
			},
		);
		marketCache = {
			data: response.data,
			timestamp: now,
		};
		return response.data;
	} catch (_e) {
		return null;
	}
}

async function getChartBuffer(config, assetId, days = '7') {
	try {
		const historyResponse = await axios.get(
			`https://api.coingecko.com/api/v3/coins/${assetId}/ohlc`,
			{
				params: { vs_currency: 'usd', days: days },
			},
		);

		const dataPoints = historyResponse.data.map((p) => ({
			x: p[0],
			o: p[1],
			h: p[2],
			l: p[3],
			c: p[4],
		}));

		return await renderChartFromData(config, assetId, dataPoints);
	} catch (_e) {
		return null;
	}
}

module.exports = {
	getMarketData,
	ASSET_IDS,
	getChartBuffer,
	KYTH_ASSET_ID: 'kyth',
};
