/**
 * @namespace: addons/core/helpers/reload-config.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const dotenv = require('@dotenvx/dotenvx');
const path = require('node:path');

const { loadKythiaConfig } = require(`${process.cwd()}/kythia.config.js`);

const envPath = path.resolve(process.cwd(), '.env');

/**
 * Reloads the `.env` file into `process.env` and refreshes `global.kythia`.
 */
function reloadConfig() {
	dotenv.config({ path: envPath, override: true, quite: true });

	global.kythia = loadKythiaConfig();
}

module.exports = { reloadConfig };
