/**
 * @namespace: addons/api/routes/addons.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { Hono } = require('hono');
const { getAddonStatuses } = require('../helpers/addons');

const app = new Hono();

// =============================================================================
// GET /api/addons
// Returns the full list of all addons with their active status.
// Dashboard uses this to conditionally show/hide sidebar links.
// =============================================================================

app.get('/', (c) => {
	const config = c.get('config') ?? c.get('client')?.container?.kythiaConfig;
	const statuses = getAddonStatuses(config);
	const active = statuses.filter((a) => a.active).length;
	const inactive = statuses.filter((a) => !a.active).length;

	return c.json({
		success: true,
		summary: { total: statuses.length, active, inactive },
		addons: statuses,
	});
});

// =============================================================================
// GET /api/addons/:key
// Returns status for a single addon by its folder key (e.g. 'quest', 'giveaway')
// =============================================================================

app.get('/:key', (c) => {
	const config = c.get('config') ?? c.get('client')?.container?.kythiaConfig;
	const key = c.req.param('key').toLowerCase();
	const statuses = getAddonStatuses(config);

	const addon = statuses.find((a) => a.key === key);
	if (!addon) {
		return c.json({ success: false, error: `Addon '${key}' not found` }, 404);
	}

	return c.json({ success: true, data: addon });
});

module.exports = app;
