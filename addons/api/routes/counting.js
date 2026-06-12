/**
 * @namespace: addons/api/routes/counting.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Hono } = require('hono');
const app = new Hono();

// Helper to get models
const getModels = (c) => c.get('client').container.models;

// GET /api/counting - List all counting configurations
app.get('/', async (c) => {
	const { Counting } = getModels(c);
	const guildId = c.req.query('guildId');

	const where = {};
	if (guildId) where.guildId = guildId;

	try {
		const data = await Counting.getAllCache({ where });
		return c.json({ success: true, count: data.length, data });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// GET /api/counting/:guildId - Get a single counting configuration
app.get('/:guildId', async (c) => {
	const { Counting } = getModels(c);
	const guildId = c.req.param('guildId');

	try {
		const result = await Counting.getCache({ guildId: guildId });
		if (!result)
			return c.json(
				{ success: false, error: 'Counting configuration not found' },
				404,
			);
		return c.json({ success: true, data: result });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// POST /api/counting - Create a new counting configuration
app.post('/', async (c) => {
	const { Counting } = getModels(c);
	const body = await c.req.json();

	if (!body.guildId || !body.channelId) {
		return c.json(
			{
				success: false,
				error: 'Missing required fields (guildId, channelId)',
			},
			400,
		);
	}

	try {
		const existing = await Counting.getCache({ guildId: body.guildId });
		if (existing) {
			return c.json(
				{
					success: false,
					error: 'Counting configuration already exists for this guild',
				},
				409,
			);
		}

		const result = await Counting.create(body);
		await result.save();

		return c.json({ success: true, data: result });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// PATCH /api/counting/:guildId - Update a counting configuration
app.patch('/:guildId', async (c) => {
	const { Counting } = getModels(c);
	const guildId = c.req.param('guildId');
	const body = await c.req.json();

	try {
		const result = await Counting.getCache({ guildId: guildId });
		if (!result)
			return c.json(
				{ success: false, error: 'Counting configuration not found' },
				404,
			);

		await result.update(body);

		await result.save();

		return c.json({ success: true, data: result });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// DELETE /api/counting/:guildId - Delete a counting configuration
app.delete('/:guildId', async (c) => {
	const { Counting } = getModels(c);
	const guildId = c.req.param('guildId');

	try {
		const result = await Counting.getCache({ guildId: guildId });
		if (!result)
			return c.json(
				{ success: false, error: 'Counting configuration not found' },
				404,
			);

		await result.destroy();
		return c.json({
			success: true,
			message: 'Counting configuration deleted successfully',
		});
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

module.exports = app;
