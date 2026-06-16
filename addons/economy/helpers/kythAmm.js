/**
 * @namespace: addons/economy/helpers/kythAmm.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

// ─── Swap Calculations ─────────────────────────────────────────────────────────

/**
 * Calculates the exact KYTH output when buying with Kythia Coin.
 * Uses the Uniswap V2 formula with fee-adjusted input.
 *
 * Formula: dy = Y - K / (X + dx_net)
 *
 * @param {number} coinIn   - Gross Kythia Coin the user wants to spend (before fee)
 * @param {object} pool     - { coinReserve, kythReserve, kConstant }
 * @returns {BuyResult}
 */
function calcBuyOutput(coinIn, pool) {
	if (coinIn <= 0) throw new RangeError('coinIn must be positive');

	const { coinReserve: X, kythReserve: Y, kConstant: K } = pool;

	// Admin-controlled fee rate via /kyth config fee_rate — fallback to 2%
	const feeRate = typeof pool.feeRate === 'number' ? pool.feeRate : 0.02;
	const coinFee = coinIn * feeRate; // Protocol fee (goes to staking pool)
	const coinInNet = coinIn - coinFee; // Net coin entering reserves

	// Core AMM: new reserve after swap
	const newX = X + coinInNet;
	const newY = K / newX;
	const kythOut = Y - newY;

	if (kythOut <= 0) {
		return {
			kythOut: 0,
			coinFee,
			coinInNet,
			newCoinReserve: X,
			newKythReserve: Y,
			priceImpactPct: 0,
			executionPrice: 0,
			midPrice: X / Y,
			feeRate,
		};
	}

	// Price impact: compare what you paid vs. the no-slippage mid-price
	const midPrice = X / Y; // Spot price before swap
	const executionPrice = coinIn / kythOut; // Actual price paid per KYTH (gross)
	const priceImpactPct = ((executionPrice - midPrice) / midPrice) * 100;

	return {
		kythOut,
		coinFee,
		coinInNet,
		newCoinReserve: newX,
		newKythReserve: newY,
		priceImpactPct, // Always positive for buys (you pay more than midprice)
		executionPrice,
		midPrice,
		feeRate, // Expose so callers can display the actual fee %
	};
}

/**
 * Calculates the exact Kythia Coin output when selling KYTH tokens.
 * Formula: dx = X - K / (Y + dy_net)
 *
 * @param {number} kythIn   - Gross KYTH the user wants to sell (before fee)
 * @param {object} pool     - { coinReserve, kythReserve, kConstant }
 * @returns {SellResult}
 */
function calcSellOutput(kythIn, pool) {
	if (kythIn <= 0) throw new RangeError('kythIn must be positive');

	const { coinReserve: X, kythReserve: Y, kConstant: K } = pool;

	// Admin-controlled fee rate via /kyth config fee_rate — fallback to 2%
	const feeRate = typeof pool.feeRate === 'number' ? pool.feeRate : 0.02;
	const kythFee = kythIn * feeRate; // Protocol fee in KYTH
	const kythInNet = kythIn - kythFee; // Net KYTH entering reserves

	const newY = Y + kythInNet;
	const newX = K / newY;
	const coinOut = X - newX;

	if (coinOut <= 0) {
		return {
			coinOut: 0,
			kythFee,
			kythInNet,
			newCoinReserve: X,
			newKythReserve: Y,
			priceImpactPct: 0,
			executionPrice: 0,
			midPrice: X / Y,
			feeRate,
		};
	}

	// For sells: executionPrice = coinOut / kythIn (Coin received per KYTH sold)
	// Negative because you receive less than the spot price
	const midPrice = X / Y;
	const executionPrice = coinOut / kythIn;
	const priceImpactPct = ((executionPrice - midPrice) / midPrice) * 100; // Will be negative

	return {
		coinOut,
		kythFee,
		kythInNet,
		newCoinReserve: newX,
		newKythReserve: newY,
		priceImpactPct, // Always negative for sells (you receive less than midprice)
		executionPrice,
		midPrice,
		feeRate, // Expose so callers can display the actual fee %
	};
}

// ─── Slippage / Min-Out ─────────────────────────────────────────────────────────

/**
 * Calculates the minimum acceptable output with a slippage tolerance.
 * If actual output < minOut, the transaction should revert.
 *
 * @param {number} expectedOut    - Expected output from calcBuyOutput/calcSellOutput
 * @param {number} slippagePct    - e.g. 0.5 means 0.5% slippage tolerance
 * @returns {number} minOut
 */
function calcMinOut(expectedOut, slippagePct = 0.5) {
	return expectedOut * (1 - slippagePct / 100);
}

// ─── Price & Stats ─────────────────────────────────────────────────────────────

/**
 * Returns the current spot price of 1 KYTH in Kythia Coin.
 * This is the "mid price" — instantaneous, no slippage.
 * @param {object} pool - { coinReserve, kythReserve }
 * @returns {number}
 */
function getSpotPrice(pool) {
	return Number(pool.coinReserve) / Number(pool.kythReserve);
}

/**
 * Returns a human-readable price impact warning level.
 * Thresholds match Uniswap V2 UI conventions.
 *
 * @param {number} impactPct - signed price impact (positive = buy, negative = sell)
 * @returns {'safe' | 'warning' | 'danger'}
 */
function getImpactLevel(impactPct) {
	const abs = Math.abs(impactPct);
	if (abs < 3) return 'safe'; // < 3%: no warning
	if (abs < 15) return 'warning'; // 3–15%: yellow warning
	return 'danger'; // > 15%: red, require confirmation
}

/**
 * Calculates the virtual circulating supply of KYTH.
 * This is: ICO_SUPPLY - kythReserve (how much has left the pool to user wallets)
 *
 * @param {number} kythReserve - current pool reserve
 * @param {number} icoSupply   - initial KYTH seeded into pool (default 10,000)
 * @returns {number} circulatingSupply
 */
function getCirculatingSupply(kythReserve, icoSupply = 10_000) {
	return Math.max(0, icoSupply - kythReserve);
}

/**
 * Formats pool state for display. Provides market data like a real DEX.
 * @param {object} pool
 * @param {number} [icoSupply=10000]
 * @returns {PoolStats}
 */
function formatPoolStats(pool, icoSupply = 10_000) {
	const coinReserve = Number(pool.coinReserve);
	const kythReserve = Number(pool.kythReserve);
	const kConstant = Number(pool.kConstant);
	const totalTaxCollected = Number(pool.totalTaxCollected);

	const spotPrice = coinReserve / kythReserve;

	// Fully Diluted Valuation = spotPrice × icoSupply (total tokens ever created)
	const fdv = spotPrice * icoSupply;

	// Market Cap = spotPrice × circulating supply (in users' hands)
	const circulating = getCirculatingSupply(kythReserve, icoSupply);
	const marketCap = spotPrice * circulating;

	// TVL (Total Value Locked) = 2× coinReserve (both sides of the pool)
	// Simplified: in a real AMM, TVL = coinReserve + kythReserve × spotPrice = 2 × coinReserve
	const tvl = coinReserve * 2;

	// K drift check: K should equal X * Y. Any drift means floating-point accumulated
	const kDrift =
		(Math.abs(kConstant - coinReserve * kythReserve) / kConstant) * 100;

	return {
		spotPrice: spotPrice.toFixed(6),
		coinReserve: coinReserve.toLocaleString(undefined, {
			maximumFractionDigits: 2,
		}),
		kythReserve: kythReserve.toFixed(6),
		kConstant: kConstant.toLocaleString(undefined, {
			maximumFractionDigits: 0,
		}),
		circulatingSupply: circulating.toFixed(6),
		marketCap: marketCap.toLocaleString(undefined, {
			maximumFractionDigits: 0,
		}),
		fdv: fdv.toLocaleString(undefined, { maximumFractionDigits: 0 }),
		tvl: tvl.toLocaleString(undefined, { maximumFractionDigits: 0 }),
		totalTaxCollected: totalTaxCollected.toLocaleString(undefined, {
			maximumFractionDigits: 0,
		}),
		kDriftPct: kDrift.toFixed(4),
	};
}

/**
 * Simulates a trade preview for display — how much would X coin buy/sell?
 * Does not modify any state.
 * @param {'buy' | 'sell'} side
 * @param {number} amount
 * @param {object} pool
 */
function simulateTrade(side, amount, pool) {
	if (side === 'buy') return calcBuyOutput(amount, pool);
	return calcSellOutput(amount, pool);
}

module.exports = {
	calcBuyOutput,
	calcSellOutput,
	calcMinOut,
	getSpotPrice,
	getImpactLevel,
	getCirculatingSupply,
	formatPoolStats,
	simulateTrade,
	FEE_RATE: 0.02,
	ICO_SUPPLY: 10_000,
};
