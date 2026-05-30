/**
 * @namespace: addons/api/routes/autoreact.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Hono } = require('hono');
const app = new Hono();

// Helper to get models
const getModels = (c) => c.get('client').container.models;

// GET /api/autoreact - List all autoreacts (with optional filters)
app.get('/', async (c) => {
	const { AutoReact } = getModels(c);
	const guildId = c.req.query('guildId');
	const userId = c.req.query('userId');
	const type = c.req.query('type');

	const where = {};
	if (guildId) where.guildId = guildId;
	if (userId) where.userId = userId;
	if (type) where.type = type;

	try {
		const data = await AutoReact.getAllCache({ where });
		return c.json({ success: true, count: data.length, data });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// GET /api/autoreact/:id - Get a single autoreact
app.get('/:id', async (c) => {
	const { AutoReact } = getModels(c);
	const id = c.req.param('id');

	try {
		const result = await AutoReact.getCache({ id: id });
		if (!result)
			return c.json({ success: false, error: 'AutoReact not found' }, 404);
		return c.json({ success: true, data: result });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// POST /api/autoreact - Create a new autoreact
app.post('/', async (c) => {
	const { AutoReact } = getModels(c);
	const body = await c.req.json();

	if (!body.guildId || !body.userId || !body.trigger || !body.emoji) {
		return c.json(
			{
				success: false,
				error: 'Missing required fields (guildId, userId, trigger, emoji)',
			},
			400,
		);
	}

	try {
		const result = await AutoReact.create(body);
		await result.save();
		return c.json({ success: true, data: result });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// PATCH /api/autoreact/:id - Update an autoreact
app.patch('/:id', async (c) => {
	const { AutoReact } = getModels(c);
	const id = c.req.param('id');
	const body = await c.req.json();

	try {
		const result = await AutoReact.getCache({ id: id });
		if (!result)
			return c.json({ success: false, error: 'AutoReact not found' }, 404);

		await result.update(body);
		await result.save();

		return c.json({ success: true, data: result });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// DELETE /api/autoreact/:id - Delete an autoreact
app.delete('/:id', async (c) => {
	const { AutoReact } = getModels(c);
	const id = c.req.param('id');

	try {
		const result = await AutoReact.getCache({ id: id });
		if (!result)
			return c.json({ success: false, error: 'AutoReact not found' }, 404);

		await result.destroy();
		return c.json({ success: true, message: 'AutoReact deleted successfully' });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

module.exports = app;
