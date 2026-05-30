/**
 * @namespace: addons/api/helpers/addon-guard.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

/**
 * @param {string} addonKey - The addon key as it appears in kythiaConfig.addons (e.g. 'quest', 'giveaway')
 * @returns {import('hono').MiddlewareHandler}
 */
function addonGuard(addonKey) {
	return async (c, next) => {
		const config = c.get('config') ?? c.get('client')?.container?.kythiaConfig;
		const addonConfig = config?.addons?.[addonKey];

		// Treat missing config key as inactive, unless addons.all.active is explicitly true
		const allActive = config?.addons?.all?.active === true;
		const isActive =
			addonConfig?.active === true || (addonConfig === undefined && allActive);

		if (!isActive) {
			return c.json(
				{
					success: false,
					addon: addonKey,
					active: false,
					error: `The '${addonKey}' addon is currently disabled. Enable it in kythia.config.js to use this API.`,
				},
				503,
			);
		}

		await next();
	};
}

module.exports = addonGuard;
