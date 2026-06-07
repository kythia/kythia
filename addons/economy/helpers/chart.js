/**
 * @namespace: addons/economy/helpers/chart.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const axios = require('axios');

/**
 * Renders a TradingView-style candlestick chart using QuickChart API v4.
 *
 * @param {Object} config - Kythia config object (for theme/colors)
 * @param {String} assetId - The label/symbol to display on the chart
 * @param {Array} dataPoints - Array of OHLC objects { x: timestamp, o: open, h: high, l: low, c: close }
 * @returns {Buffer|null} PNG Image Buffer or null on failure
 */
async function renderChartFromData(_config, assetId, dataPoints) {
	try {
		const chartConfig = {
			type: 'candlestick',
			data: {
				datasets: [
					{
						label: assetId.toUpperCase(),
						data: dataPoints,
						color: {
							up: '#26a69a',
							down: '#ef5350',
							unchanged: '#999',
						},
						borderColor: {
							up: '#26a69a',
							down: '#ef5350',
							unchanged: '#999',
						},
					},
				],
			},
			options: {
				plugins: {
					legend: { display: false },
				},
				scales: {
					x: {
						type: 'time',
						ticks: { color: 'rgba(255, 255, 255, 0.7)' },
						grid: { color: 'rgba(255, 255, 255, 0.1)' },
					},
					y: {
						position: 'right',
						ticks: { color: 'rgba(255, 255, 255, 0.7)' },
						grid: { color: 'rgba(255, 255, 255, 0.1)' },
					},
				},
			},
		};

		const response = await axios.post(
			'https://quickchart.io/chart',
			{
				chart: chartConfig,
				backgroundColor: '#131722', // Tradingview dark theme
				width: 550,
				height: 350,
				version: '4',
			},
			{
				responseType: 'arraybuffer',
			},
		);

		return response.data;
	} catch (_e) {
		return null;
	}
}

module.exports = {
	renderChartFromData,
};
