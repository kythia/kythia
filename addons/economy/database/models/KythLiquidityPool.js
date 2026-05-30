/**
 * @namespace: addons/economy/database/models/KythLiquidityPool.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { KythiaModel } = require('kythia-core');

class KythLiquidityPool extends KythiaModel {
	// Single-row table: always id=1
	static cacheKeys = [['id']];
	static CACHE_TTL = 5 * 1000; // 5 second TTL — very short, pool state changes frequently
	static guarded = [];
}

module.exports = KythLiquidityPool;
