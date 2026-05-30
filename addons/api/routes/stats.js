/**
 * @namespace: addons/api/routes/stats.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Hono } = require('hono');
const { broadcastGetStats } = require('../helpers/shard');

const app = new Hono();

app.get('/', async (c) => {
	const client = c.get('client');

	const { guilds, users, totalMemory } = await broadcastGetStats(client);

	return c.json({
		ping: client.ws.ping,
		uptime: client.container.shutdownManager.getMasterUptime(),
		guilds,
		users,
		ram_usage: `${(totalMemory / 1024 / 1024).toFixed(2)} MB`,
	});
});

module.exports = app;
