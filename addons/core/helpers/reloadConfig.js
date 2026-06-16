/**
 * @namespace: addons/core/helpers/reloadConfig.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const dotenv = require('@dotenvx/dotenvx');
const path = require('node:path');

const kythiaConfigExport = require(`${process.cwd()}/kythia.config.js`);
const { loadKythiaConfig } = kythiaConfigExport;

const envPath = path.resolve(process.cwd(), '.env');

/**
 * Reloads the `.env` file into `process.env` and refreshes the existing config references.
 */
function reloadConfig() {
	dotenv.config({ path: envPath, override: true, quiet: true });

	const newConfig = loadKythiaConfig();

	Object.assign(global.kythia, newConfig);

	Object.assign(kythiaConfigExport, newConfig);
}

module.exports = { reloadConfig };
