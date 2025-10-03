/**
 * @file src/utils/reload_config.js
 * @description Reloads environment variables from `.env` and refreshes the global `kythia` config
 * by invoking the `loadKythiaConfig` function from `kythia.config.js`.
 * Intended for hot-reloading configuration without restarting the process.
 * © 2025 kenndeclouv — v0.9.8-beta
 */

const dotenv = require('dotenv');
const path = require('path');
// Import our configuration loader from kythia.config.js
const { loadKythiaConfig } = require('../../kythia.config.js');
const logger = require('./logger.js');

const envPath = path.resolve(process.cwd(), '.env');

/**
 * Reloads the `.env` file into `process.env` and refreshes `global.kythia`.
 */
function reloadConfig() {
    // Reload variables from .env into process.env
    dotenv.config({ path: envPath, override: true });

    // Re-invoke the config loader to refresh global.kythia
    global.kythia = loadKythiaConfig();

    logger.info('✅ Configuration from .env has been reloaded and applied.');
}

module.exports = { reloadConfig };
