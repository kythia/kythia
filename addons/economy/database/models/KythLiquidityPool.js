/**
 * @namespace: addons/economy/database/models/KythLiquidityPool.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { KythiaModel } = require('kythia-core');

class KythLiquidityPool extends KythiaModel {
	static table = 'kythia_liquidity_pool';
	// Single-row table: always id=1
	static cacheKeys = [['id']];
	static CACHE_TTL = 5 * 1000; // 5 second TTL — very short, pool state changes frequently
	static guarded = [];
}

module.exports = KythLiquidityPool;
