/**
 * @namespace: addons/api/helpers/addons.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const fs = require('node:fs');
const path = require('node:path');

const ADDONS_DIR = path.join(process.cwd(), 'addons');

/**
 * Read addon.json from every addon directory and merge with the runtime
 * kythiaConfig to produce a unified status list.
 */
function getAddonStatuses(kythiaConfig) {
	const addonsConfig = kythiaConfig?.addons ?? {};
	const allActive = addonsConfig?.all?.active !== false; // default true unless explicitly disabled

	const results = [];

	if (!fs.existsSync(ADDONS_DIR)) return results;

	const dirs = fs.readdirSync(ADDONS_DIR).filter((name) => {
		const full = path.join(ADDONS_DIR, name);
		return fs.statSync(full).isDirectory();
	});

	for (const addonDir of dirs) {
		const jsonPath = path.join(ADDONS_DIR, addonDir, 'addon.json');
		let manifest = {};
		if (fs.existsSync(jsonPath)) {
			try {
				manifest = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
			} catch {
				manifest = {};
			}
		}

		const addonCfg = addonsConfig[addonDir];

		// Determine active status: explicit entry beats allActive default
		let active;
		if (addonCfg === undefined) {
			active = allActive;
		} else {
			active = addonCfg.active !== false;
		}

		results.push({
			key: addonDir,
			name: manifest.name ?? addonDir,
			featureName: manifest.featureName ?? null,
			featureFlag: manifest.featureFlag ?? null,
			active,
			version: manifest.version ?? null,
			description: manifest.description ?? null,
		});
	}

	// Sort: active first, then alphabetically
	results.sort((a, b) => {
		if (a.active !== b.active) return a.active ? -1 : 1;
		return a.key.localeCompare(b.key);
	});

	return results;
}

module.exports = {
	getAddonStatuses,
};
