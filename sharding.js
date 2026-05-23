/**
 * @file sharding.js
 * @description Entry point for the Kythia Discord Bot using Discord.js ShardingManager.
 * This file is responsible for spawning and managing multiple shards of the bot,
 * ensuring optimal performance and stability across large numbers of guilds.
 *
 * It uses the 'kythia-core' ShardingManager to spawn the main bot process ('index.js').
 *
 * @author kenndeclouv
 * @license CC-BY-NC-4.0
 * @copyright 2025 Kythia Labs
 * @version 1.0.0-rc
 */

require('@dotenvx/dotenvx').config({ quiet: true }); // Loads ENV vars to process.env

const { ShardingManager } = require('kythia-core');
const kythiaConfig = require('./kythia.config');
const path = require('node:path');

const manager = new ShardingManager({
	scriptPath: path.join(__dirname, 'index.js'),
	token: kythiaConfig.bot.token,
	totalShards: kythiaConfig.bot.totalShards,
	maxOldSpaceSizeMb: 2048,
	config: kythiaConfig,
	licenseKey: kythiaConfig.licenseKey,
	webhookErrorLogs:
		kythiaConfig.api?.webhookErrorLogs || process.env.WEBHOOK_ERROR_LOGS,
});

manager.spawn().catch((err) => {
	// biome-ignore lint/suspicious/noConsole: using console as the logger not yet loaded
	console.error('❌ Failed to spawn shards:', err);
});
