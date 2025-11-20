/**
 * @namespace: addons/economy/helpers/market.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const axios = require('axios');

let marketCache = {
    data: null,
    timestamp: 0,
};

const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

const ASSET_IDS = ['bitcoin', 'ethereum', 'solana', 'dogecoin'];

async function getMarketData() {
    const now = Date.now();
    if (marketCache.data && now - marketCache.timestamp < CACHE_DURATION_MS) {
        return marketCache.data;
    }
    // Fetch data baru dari API
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
            ids: ASSET_IDS.join(','),
            vs_currencies: 'usd',
            include_24hr_change: 'true',
        },
    });
    marketCache = {
        data: response.data,
        timestamp: now,
    };
    return response.data;
}
async function getChartBuffer(assetId) {
    try {
        const historyResponse = await axios.get(`https://api.coingecko.com/api/v3/coins/${assetId}/market_chart`, {
            params: { vs_currency: 'usd', days: '7' },
        });
        const prices = historyResponse.data.prices;
        const dailyPrices = prices.filter((_, index) => index % 24 === 0);

        const labels = dailyPrices.map((p) => new Date(p[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const dataPoints = dailyPrices.map((p) => p[1]);

        // Use color from kythia.bot.color (assume global, as in other files)
        const hexColor = kythia?.bot?.color || '#4bc0c0'; // fallback to old cyan if undefined

        // Helper to convert HEX to rgba
        function hexToRgba(hex, alpha = 1) {
            let c = hex.replace('#', '');
            if (c.length === 3)
                c = c
                    .split('')
                    .map((x) => x + x)
                    .join('');
            const num = parseInt(c, 16);
            const r = (num >> 16) & 255;
            const g = (num >> 8) & 255;
            const b = num & 255;
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }

        const chartConfig = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: assetId.toUpperCase(),
                        data: dataPoints,
                        fill: true,
                        backgroundColor: hexToRgba(hexColor, 0.2),
                        borderColor: hexColor,
                        borderWidth: 2,
                        pointRadius: 1,
                    },
                ],
            },
            options: {
                plugins: {
                    legend: { display: false },
                },
                scales: {
                    y: {
                        ticks: { color: 'white' },
                    },
                    x: {
                        ticks: { color: 'white' },
                    },
                },
            },
        };
        // --- SELESAI PERUBAHAN ---

        const response = await axios.post(
            'https://quickchart.io/chart',
            {
                chart: chartConfig,
                backgroundColor: 'rgb(47,49,54)',
                width: 550, // Sedikit lebih kecil biar pas di embed
                height: 350,
            },
            {
                responseType: 'arraybuffer',
            }
        );

        return response.data;
    } catch (error) {
        console.error(`Failed to generate chart for ${assetId}:`, error.response ? error.response.data : error.message);
        return null;
    }
}

module.exports = {
    getMarketData,
    ASSET_IDS,
    getChartBuffer,
};
