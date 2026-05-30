/**
 * @namespace: addons/api/routes/metrics.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Hono } = require('hono');
const app = new Hono();

app.get('/', async (c) => {
	const container = c.get('container');
	const { metrics } = container;

	if (!metrics) {
		return c.text('Metrics unavailable', 503);
	}

	const format = c.req.query('format');
	if (format === 'json') {
		const jsonMetrics = await metrics.registry.getMetricsAsJSON();
		return c.json(jsonMetrics);
	}

	const rawMetrics = await metrics.getMetrics();
	c.header('Content-Type', metrics.getContentType());
	return c.body(rawMetrics);
});

module.exports = app;
