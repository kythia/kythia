/**
 * @namespace: addons/api/routes/economy.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Hono } = require('hono');
const { Op, fn, col } = require('sequelize');

const app = new Hono();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getModels = (c) => c.get('client').container.models;
const getLogger = (c) => c.get('client').container.logger;

// ---------------------------------------------------------------------------
// GET /api/economy/pool
// Fetch the current Kythia Liquidity Pool state and config
// ---------------------------------------------------------------------------
app.get('/pool', async (c) => {
	const models = getModels(c);
	const { KythLiquidityPool } = models;

	try {
		const pool = await KythLiquidityPool.getCache({ id: 1 });

		if (!pool) {
			return c.json({ success: false, error: 'Liquidity pool not found' }, 404);
		}

		// Calculate current price: 1 KYTH = X Coins
		// In a constant product AMM (X * Y = K), price of Y in terms of X is roughly X / Y
		const price = pool.coinReserve / pool.kythReserve;

		return c.json({
			success: true,
			data: {
				id: pool.id,
				price,
				reserves: {
					coinReserve: pool.coinReserve,
					kythReserve: pool.kythReserve,
				},
				kConstant: pool.kConstant,
				totalTaxCollected: pool.totalTaxCollected,
				lastBurnAt: pool.lastBurnAt,
				config: {
					tradingHalted: pool.tradingHalted,
					feeRatePct: pool.feeRatePct,
					minTradeAmount: pool.minTradeAmount,
					maxTradeAmount: pool.maxTradeAmount,
					burnActive: pool.burnActive,
					burnRatePct: pool.burnRatePct,
					dividendActive: pool.dividendActive,
					dividendSplitPct: pool.dividendSplitPct,
					blackmarketActive: pool.blackmarketActive,
					stakingActive: pool.stakingActive,
					stakingMinKyth: pool.stakingMinKyth,
				},
				updatedAt: pool.updatedAt,
			},
		});
	} catch (error) {
		getLogger(c).error(
			`GET /api/economy/pool error: ${error.message || error}`,
			{ label: 'api:economy' },
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// PATCH /api/economy/pool/config
// Update the Kythia Liquidity Pool configuration
// ---------------------------------------------------------------------------
app.patch('/pool/config', async (c) => {
	const models = getModels(c);
	const { KythLiquidityPool } = models;

	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	try {
		const pool = await KythLiquidityPool.getCache({ id: 1 });
		if (!pool) {
			return c.json({ success: false, error: 'Liquidity pool not found' }, 404);
		}

		const ALLOWED = new Set([
			'tradingHalted',
			'feeRatePct',
			'minTradeAmount',
			'maxTradeAmount',
			'burnActive',
			'burnRatePct',
			'dividendActive',
			'dividendSplitPct',
			'blackmarketActive',
			'stakingActive',
			'stakingMinKyth',
		]);

		let updated = false;
		for (const key of Object.keys(body)) {
			if (!ALLOWED.has(key)) continue;

			const value = body[key];
			if (typeof value === 'boolean') {
				pool[key] = value;
				updated = true;
			} else if (typeof value === 'number') {
				pool[key] = value;
				updated = true;
			}
		}

		if (updated) {
			await pool.save();
		}

		return c.json({ success: true, data: pool });
	} catch (error) {
		getLogger(c).error(
			`PATCH /api/economy/pool/config error: ${error.message || error}`,
			{ label: 'api:economy' },
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// GET /api/economy/leaderboard
// Get a paginated leaderboard of users sorted by total Kyth (holding + staked)
// ---------------------------------------------------------------------------
app.get('/leaderboard', async (c) => {
	const models = getModels(c);
	const { KythiaUser } = models;
	const { limit = '50', page = '1' } = c.req.query();

	const pageNum = parseInt(page, 10) || 1;
	const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
	const offsetNum = (pageNum - 1) * limitNum;

	try {
		const { count, rows } = await KythiaUser.paginateCache({
			where: {
				[Op.or]: [
					{ kythHolding: { [Op.gt]: 0 } },
					{ kythStaked: { [Op.gt]: 0 } },
				],
			},
			order: [['kythHolding', 'DESC']],
			page: pageNum,
			pageSize: limitNum,
		});

		const client = c.get('client');
		const { broadcastGetUsers } = require('../../api/helpers/shard');
		const userIds = rows.map((r) => r.userId);

		let userMap = new Map();
		if (userIds.length > 0) {
			const cachedUsers = await broadcastGetUsers(client, userIds);
			userMap = new Map(cachedUsers.map((u) => [u.id, u]));
		}

		const data = rows.map((u, i) => {
			const userObj = userMap.get(u.userId);
			const totalKyth = (u.kythHolding || 0) + (u.kythStaked || 0);

			return {
				rank: offsetNum + i + 1,
				userId: u.userId,
				username: userObj?.username ?? null,
				avatar: userObj?.avatar ?? null,
				kythHolding: u.kythHolding || 0,
				kythStaked: u.kythStaked || 0,
				totalKyth,
			};
		});

		// Sort by totalKyth in memory for the current page since literal order might fail on some DBs
		data.sort((a, b) => b.totalKyth - a.totalKyth);

		// Recalculate rank after memory sort
		data.forEach((item, i) => {
			item.rank = offsetNum + i + 1;
		});

		return c.json({
			success: true,
			count,
			page: pageNum,
			totalPages: Math.ceil(count / limitNum),
			data,
		});
	} catch (error) {
		getLogger(c).error(
			`GET /api/economy/leaderboard error: ${error.message || error}`,
			{ label: 'api:economy' },
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// GET /api/economy/stats
// Get global Kyth ecosystem statistics
// ---------------------------------------------------------------------------
app.get('/stats', async (c) => {
	const models = getModels(c);
	const { KythiaUser, KythLiquidityPool } = models;

	try {
		const pool = await KythLiquidityPool.getCache({ id: 1 });
		const price = pool ? pool.coinReserve / pool.kythReserve : 0;

		const sumAgg = await KythiaUser.aggregateWithCache({
			attributes: [
				[fn('SUM', col('kythHolding')), 'holding'],
				[fn('SUM', col('kythStaked')), 'staked'],
			],
			raw: true,
		});
		const totalCirculating = Number(sumAgg[0]?.holding || 0);
		const totalStaked = Number(sumAgg[0]?.staked || 0);
		const totalHolders = await KythiaUser.countWithCache({
			where: { kythHolding: { [Op.gt]: 0 } },
		});
		const totalStakers = await KythiaUser.countWithCache({
			where: { kythStaked: { [Op.gt]: 0 } },
		});

		const marketCap = (totalCirculating + totalStaked) * price;

		return c.json({
			success: true,
			data: {
				price,
				marketCap,
				totalCirculating,
				totalStaked,
				poolKythReserve: pool?.kythReserve || 0,
				poolCoinReserve: pool?.coinReserve || 0,
				totalHolders,
				totalStakers,
				stakedPercentage:
					totalCirculating + totalStaked > 0
						? (totalStaked / (totalCirculating + totalStaked)) * 100
						: 0,
			},
		});
	} catch (error) {
		getLogger(c).error(
			`GET /api/economy/stats error: ${error.message || error}`,
			{ label: 'api:economy' },
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// GET /api/economy/stocks
// Get the S&P 500 Top Guild Stocks Leaderboard
// ---------------------------------------------------------------------------
app.get('/stocks', async (c) => {
	const models = getModels(c);
	const { GuildLiquidityPool } = models;

	if (!GuildLiquidityPool) {
		return c.json({ success: true, data: [] });
	}

	try {
		const pools = await GuildLiquidityPool.getAllCache();
		if (!pools || pools.length === 0) {
			return c.json({ success: true, data: [] });
		}

		const mappedPools = pools.map((pool) => {
			const price = pool.kythReserve / pool.tokenReserve;
			const marketCap = price * pool.tokenReserve;
			return {
				guildId: pool.guildId,
				ticker: pool.ticker,
				price,
				marketCap,
				kythReserve: pool.kythReserve,
				tokenReserve: pool.tokenReserve,
				feeRatePct: pool.feeRatePct,
			};
		});

		mappedPools.sort((a, b) => b.marketCap - a.marketCap);
		const topPools = mappedPools.slice(0, 50);

		return c.json({ success: true, data: topPools });
	} catch (error) {
		getLogger(c).error(
			`GET /api/economy/stocks error: ${error.message || error}`,
			{ label: 'api:economy' },
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// GET /api/economy/users/:userId
// Get a specific user's Kyth portfolio
// ---------------------------------------------------------------------------
app.get('/users/:userId', async (c) => {
	const models = getModels(c);
	const { KythiaUser, KythLiquidityPool } = models;
	const { userId } = c.req.param();

	try {
		const user = await KythiaUser.getCache({ userId });
		if (!user) {
			return c.json({ success: false, error: 'User not found' }, 404);
		}

		const pool = await KythLiquidityPool.getCache({ id: 1 });
		const price = pool ? pool.coinReserve / pool.kythReserve : 0;

		const holdingValue = (user.kythHolding || 0) * price;
		const stakedValue = (user.kythStaked || 0) * price;

		return c.json({
			success: true,
			data: {
				userId: user.userId,
				kythHolding: user.kythHolding || 0,
				kythStaked: user.kythStaked || 0,
				totalKyth: (user.kythHolding || 0) + (user.kythStaked || 0),
				valuations: {
					holdingValueCoins: holdingValue,
					stakedValueCoins: stakedValue,
					totalValueCoins: holdingValue + stakedValue,
				},
				coinBalance: user.wallet || 0, // Fallback if property is named wallet or balance
			},
		});
	} catch (error) {
		getLogger(c).error(
			`GET /api/economy/users/:userId error: ${error.message || error}`,
			{ label: 'api:economy' },
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// GET /api/economy/market/transactions
// Get recent market transactions for KYTH
// ---------------------------------------------------------------------------
app.get('/market/transactions', async (c) => {
	const models = getModels(c);
	const { MarketTransaction } = models;
	const { limit = '50', page = '1' } = c.req.query();

	const pageNum = parseInt(page, 10) || 1;
	const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));

	try {
		if (!MarketTransaction) {
			return c.json(
				{ success: false, error: 'Market transactions not enabled' },
				404,
			);
		}

		const { count, rows } = await MarketTransaction.paginateCache({
			where: { assetId: 'KYTH' },
			order: [['createdAt', 'DESC']],
			page: pageNum,
			pageSize: limitNum,
		});

		return c.json({
			success: true,
			count,
			page: pageNum,
			totalPages: Math.ceil(count / limitNum),
			data: rows,
		});
	} catch (error) {
		getLogger(c).error(
			`GET /api/economy/market/transactions error: ${error.message || error}`,
			{ label: 'api:economy' },
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// GET /api/economy/chart
// Get historical price data for trading charts
// ---------------------------------------------------------------------------
app.get('/chart', async (c) => {
	const models = getModels(c);
	const { MarketTransaction, KythLiquidityPool } = models;
	const { limit = '500' } = c.req.query();

	const limitNum = Math.min(2000, Math.max(1, parseInt(limit, 10) || 500));

	try {
		if (!MarketTransaction) {
			return c.json(
				{ success: false, error: 'Market transactions not enabled' },
				404,
			);
		}

		// Retrieve the latest raw transactions to build the chart
		// For a complete TradingView style OHLC chart, the frontend or backend would group by time intervals.
		// We return the raw data points here to allow maximum flexibility.
		const transactions = await MarketTransaction.getAllCache({
			where: { assetId: 'KYTH' },
			order: [['createdAt', 'ASC']],
			limit: limitNum,
		});

		// Format to standard chart data points
		const dataPoints = transactions.map((tx) => ({
			time: new Date(tx.createdAt).getTime(),
			price: tx.price,
			volume: tx.quantity,
			type: tx.type, // 'buy' or 'sell'
		}));

		// Include current live price as the final data point
		const pool = await KythLiquidityPool.getCache({ id: 1 });
		if (pool) {
			const currentPrice = pool.coinReserve / pool.kythReserve;
			dataPoints.push({
				time: Date.now(),
				price: currentPrice,
				volume: 0,
				type: 'current',
			});
		}

		return c.json({
			success: true,
			data: dataPoints,
		});
	} catch (error) {
		getLogger(c).error(
			`GET /api/economy/chart error: ${error.message || error}`,
			{ label: 'api:economy' },
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

module.exports = app;
