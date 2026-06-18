/**
 * ======================================================
 * 🚀 Kythia Discord Bot - Main Worker Entry File
 * ======================================================
 * @file index.js
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 26.1.0
 *
 * @description
 * This file serves as the main entry point for the Kythia Discord Bot application.
 * It is responsible for setting up the runtime environment, loading dependencies,
 * wiring up configuration and models, and then launching the bot by instantiating
 * and invoking the main Kythia class.
 *
 * ------------------------------------------------------
 * ENVIRONMENT SETUP & REQUIREMENTS
 * ------------------------------------------------------
 *
 * 1. dotenv - Loads environment variables from .env into process.env, ensuring
 *    sensitive data/configurations are available before dependencies initialize.
 *
 * 2. kythia.config.js - App-Level config loader (returns a config object, composed from
 *    package.json, environment, and sensible defaults).
 *
 * 3. module-alias/register - Reads _moduleAliases in package.json and rewires require() so that
 *    aliases like @src, @utils, @coreModels, etc., work everywhere in the codebase.
 *    This must be called BEFORE any imports using such aliases.
 *
 * ------------------------------------------------------
 * DEPENDENCY WIRES & SHORT EXPLANATION
 * ------------------------------------------------------
 * - translator:     Handles i18n (multi-language) text lookup and dynamic translation.
 * - isTeam/isOwner: Helper fns for checking bot ownership/admin status in Discord operations.
 * - ServerSetting:  Sequelize model for per-guild/persistent server config.
 * - KythiaVoter:    Sequelize model for storing Top.gg or similar voting data.
 * - Redis:          Redis client for caching, rate limiting, or persistent/transient storage.
 * - sequelize:      ORM instance initialized with config+logger, for connecting to the DB backend.
 * - KythiaModel:    Dynamic data model, receives logger/config/redis dependencies for various bot ops.
 *
 * ------------------------------------------------------
 * MAIN Kythia CLASS BOOTSTRAP FLOW
 * ------------------------------------------------------
 * - dependencies: Aggregation of services, helpers, and models injected to Kythia.
 *     - config, logger, translator, redis, sequelize
 *     - models: ServerSetting, KythiaVoter, ...
 *     - helpers: Discord permission/status helpers
 * - Kythia.start(): Triggers bot initialization, addon loading, Discord login, etc.
 *
 * ------------------------------------------------------
 * SAFETY NOTES:
 * ------------------------------------------------------
 * - Configuration and all secrets should be provided in the .env file or ENV vars before running.
 * - If adding/changing module aliases, update package.json and ensure `module-alias/register` is loaded before using such aliases in code!
 */

// ===== 1. Load Environment Variables (.env) and Aliases =====
require('@dotenvx/dotenvx').config({ quiet: true }); // Loads ENV vars to process.env
const kythiaConfig = require('./kythia.config.js'); // Unified configuration object
require('module-alias/register'); // Enables @src, @utils, etc. path aliases
const { Kythia, KythiaModel, createSequelizeInstance } = require('kythia-core');
const client = require('./src/client');
const { version: botVersion } = require('./package.json');

// ===== 2. Load Core Helpers & Utilities with Meaningful Descriptions =====

const {
	isTeam,
	isPremium,
	voteLocked,
	embedFooter,
	getRoleSafe,
	getUserSafe,
	getGuildSafe,
	getMemberSafe,
	isVoterActive,
	premiumLocked,
	getAllBansSafe,
	getChannelSafe,
	getMessageSafe,
	createContainer,
	getAllRolesSafe,
	simpleContainer,
	chunkTextDisplay,
	getAllEmojisSafe,
	getAllInvitesSafe,
	getAllMembersSafe,
	refreshObjectSafe,
	getAllChannelsSafe,
	getAllStickersSafe,
	getTextChannelSafe,
	resolvePartialSafe,
	getChannelGlobalSafe,
	setVoiceChannelStatus,
	fetchMessagesQuerySafe,
	createPaginationContainer,
} = require('@coreHelpers/discord'); // Discord helper funcs for permissions/identity

const {
	checkCooldown,
	parseDuration,
	formatDuration,
} = require('@coreHelpers/time');

const { getHelpData, buildHelpReply } = require('@coreHelpers/helpUtils');
const { getGuildPremiumTier } = require('@coreHelpers/premiumServer');

// ===== 3. Load Additional Utilities =====
const { convertColor } = require('kythia-core').utils;

// ===== 4. Setup Sequelize ORM Instance for Relational Database Access =====
// Create a Sequelize instance, provided with config and logger for flex diagnostics
const sequelize = createSequelizeInstance(kythiaConfig);

// ===== 5. Set Up Models' Internal Dependencies =====
KythiaModel.setDependencies({
	config: kythiaConfig,
	redisOptions: kythiaConfig.db.redis,
}); // Inject utility deps

// ===== 6. Collect All Service/Model Deps for Containerized Injection =====
/**
 * dependencies:
 *  - [!] config:       Entire config object tree needed by bot internals
 *  - [o] logger:       For logging during run and error situations
 *  - [!] redis:        Redis client for fast key-value or queue storage
 *  - [!] sequelize:    ORM instance, used for all SQL model work
 *  - [!] models:       Business-related models, grouped for convenience
 *  - [!] helpers:      Utility helpers, grouped by domain (e.g. discord)
 *
 *  - [!] indicates required!
 *  - [o] indicates optional
 */
const dependencies = {
	client,
	config: kythiaConfig,
	botVersion,
	bootSalt: Date.now(),
	redis: KythiaModel.redis,
	sequelize: sequelize,
	models: {},
	helpers: {
		discord: {
			isTeam,
			isPremium,
			voteLocked,
			embedFooter,
			getRoleSafe,
			getUserSafe,
			getGuildSafe,
			getMemberSafe,
			isVoterActive,
			premiumLocked,
			getAllBansSafe,
			getChannelSafe,
			getMessageSafe,
			createContainer,
			getAllRolesSafe,
			simpleContainer,
			chunkTextDisplay,
			getAllEmojisSafe,
			getAllInvitesSafe,
			getAllMembersSafe,
			refreshObjectSafe,
			getAllChannelsSafe,
			getAllStickersSafe,
			getTextChannelSafe,
			resolvePartialSafe,
			getChannelGlobalSafe,
			setVoiceChannelStatus,
			fetchMessagesQuerySafe,
			createPaginationContainer,
		},
		color: { convertColor },
		time: { checkCooldown, formatDuration, parseDuration },
		helpUtils: { getHelpData, buildHelpReply },
		premiumServer: { getGuildPremiumTier },
	},
	appRoot: __dirname,
};

// ===== 7. Actual Boot Process: Instantiate and Start the Bot =====
try {
	/**
	 * kythiaInstance: The live bot instance, receives all dependencies for DI via constructor.
	 *  - start():        Boots the bot; attaches to Discord, loads addons, connects events, etc.
	 */
	const kythiaInstance = new Kythia(dependencies);

	kythiaInstance.container.translator.setLanguageResolver(async (guildId) => {
		const { ServerSetting } = kythiaInstance.container.models;

		if (!ServerSetting) return null;

		try {
			const setting = await ServerSetting.getCache({ guildId });
			return setting?.lang || null;
		} catch (_e) {
			return null;
		}
	});

	kythiaInstance.start();
} catch (error) {
	// biome-ignore lint/suspicious/noConsole: not initiate the logger
	console.error('🔥 FATAL ERROR during initialization:', error);
	process.exit(1);
}
