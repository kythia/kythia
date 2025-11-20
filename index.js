/**
 * ======================================================
 * 🚀 Kythia Discord Bot - Main Worker Entry File
 * ======================================================
 * @file index.js
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
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
 * - logger:         Utility for logging bot activity/errors to console and external sinks.
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
 * - dbDependencies: Used only for db-specific modules like KythiaModel during startup.
 * - Kythia.start(): Triggers bot initialization, addon loading, Discord login, etc.
 *
 * ------------------------------------------------------
 * SAFETY NOTES:
 * ------------------------------------------------------
 * - Configuration and all secrets should be provided in the .env file or ENV vars before running.
 * - If adding/changing module aliases, update package.json and ensure `module-alias/register` is loaded before using such aliases in code!
 */

// ===== 1. Load Environment Variables (.env) and Aliases =====
require('dotenv').config(); // Loads ENV vars to process.env
const kythiaConfig = require('./kythia.config.js'); // Unified configuration object
require('module-alias/register'); // Enables @src, @utils, etc. path aliases
const { Kythia, KythiaModel, createSequelizeInstance } = require('kythia-core');

// ===== 2. Load Core Helpers & Utilities with Meaningful Descriptions =====
const logger = require('@coreHelpers/logger'); // Logging system (console and ext. sinks)
const translator = require('@coreHelpers/translator'); // I18n (Internationalization) manager
const { isOwner, isTeam, embedFooter, isPremium, setVoiceChannelStatus, isVoterActive, simpleContainer } = require('@coreHelpers/discord'); // Discord helper funcs for permissions/identity
const { checkCooldown, formatDuration, parseDuration } = require('@coreHelpers/time');

// ===== 3. Load Database Models: Sequelize Models =====
// const ServerSetting = require('@coreModels/ServerSetting'); // Guild/server config model
// const KythiaVoter = require('@coreModels/KythiaVoter'); // User voter model (e.g. from Top.gg votes)

// ===== 4. Setup Redis Client for caching, queueing, etc =====
const Redis = require('ioredis');
const convertColor = require('kythia-core').utils.color;
// We create a Redis client instance, using the URL in config, in lazy mode (connect on use).

// ===== 5. Setup Sequelize ORM Instance for Relational Database Access =====
// Create a Sequelize instance, provided with config and logger for flex diagnostics
const sequelize = createSequelizeInstance(kythiaConfig, logger);

// ===== 6. Set Up Models' Internal Dependencies =====
KythiaModel.setDependencies({ logger, config: kythiaConfig, redisOptions: kythiaConfig.db.redis }); // Inject utility deps

// ===== 7. Collect All Service/Model Deps for Containerized Injection =====
/**
 * dependencies:
 *  - config:       Entire config object tree needed by bot internals
 *  - logger:       For logging during run and error situations
 *  - translator:   For i18n mechanisms
 *  - redis:        Redis client for fast key-value or queue storage
 *  - sequelize:    ORM instance, used for all SQL model work
 *  - models:       Business-related models, grouped for convenience
 *  - helpers:      Utility helpers, grouped by domain (e.g. discord)
 */
const dependencies = {
    config: kythiaConfig,
    logger: logger,
    translator: translator,
    redis: KythiaModel.redis,
    sequelize: sequelize,
    models: {},
    helpers: {
        discord: { isOwner, isTeam, embedFooter, isPremium, setVoiceChannelStatus, isVoterActive, simpleContainer },
        color: { convertColor },
        time: { checkCooldown, formatDuration, parseDuration },
    },
    appRoot: __dirname,
};

// ===== 8. Actual Boot Process: Instantiate and Start the Bot =====
try {
    /**
     * kythiaInstance: The live bot instance, receives all dependencies for DI via constructor.
     *  - dbDependencies: Some db models require injected context/config after construction.
     *  - start():        Boots the bot; attaches to Discord, loads addons, connects events, etc.
     */
    const kythiaInstance = new Kythia(dependencies);
    kythiaInstance.dbDependencies = {
        KythiaModel, // Model with pre-wired dependencies
        logger, // Reference for DB/model logging
        config: kythiaConfig,
    };
    kythiaInstance.start();
} catch (error) {
    // If logger isn't available, fallback to console.
    const log = logger || console;
    log.error('🔥 FATAL ERROR during initialization:', error);
    process.exit(1);
}
