/**
 * @namespace: addons/economy/database/models/GuildLiquidityPool.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { KythiaModel } = require('kythia-core');

class GuildLiquidityPool extends KythiaModel {
	static table = 'guild_liquidity_pools';
	static cacheKeys = [['guildId'], ['ticker']];
	static CACHE_TTL = 30 * 1000; // 30 seconds TTL
	static guarded = [];
}

module.exports = GuildLiquidityPool;
