/**
 * @namespace: addons/economy/database/models/GuildTokenHolding.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { KythiaModel } = require('kythia-core');

class GuildTokenHolding extends KythiaModel {
	static table = 'guild_token_holdings';
	static cacheKeys = [['userId', 'guildId'], ['userId'], ['guildId']];
	static CACHE_TTL = 30 * 1000; // 30 seconds TTL
	static guarded = [];
}

module.exports = GuildTokenHolding;
