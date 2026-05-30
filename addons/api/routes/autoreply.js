/**
 * @namespace: addons/api/routes/autoreply.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Hono } = require('hono');
const app = new Hono();

// Helper to get models
const getModels = (c) => c.get('client').container.models;

// GET /api/autoreply - List all autoreplies (with optional filters)
app.get('/', async (c) => {
	const { AutoReply } = getModels(c);
	const guildId = c.req.query('guildId');
	const userId = c.req.query('userId');

	const where = {};
	if (guildId) where.guildId = guildId;
	if (userId) where.userId = userId;

	try {
		const data = await AutoReply.getAllCache({ where });
		return c.json({ success: true, count: data.length, data });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// GET /api/autoreply/:id - Get a single autoreply
app.get('/:id', async (c) => {
	const { AutoReply } = getModels(c);
	const id = c.req.param('id');

	try {
		const result = await AutoReply.getCache({ id: id });
		if (!result)
			return c.json({ success: false, error: 'AutoReply not found' }, 404);
		return c.json({ success: true, data: result });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// POST /api/autoreply - Create a new autoreply
app.post('/', async (c) => {
	const { AutoReply } = getModels(c);
	const body = await c.req.json();

	if (
		!body.guildId ||
		!body.userId ||
		!body.trigger ||
		(!body.response && !body.media)
	) {
		return c.json(
			{
				success: false,
				error:
					'Missing required fields (guildId, userId, trigger, and either response or media)',
			},
			400,
		);
	}

	try {
		const result = await AutoReply.create(body);
		await result.save();
		return c.json({ success: true, data: result });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// PATCH /api/autoreply/:id - Update an autoreply
app.patch('/:id', async (c) => {
	const { AutoReply } = getModels(c);
	const id = c.req.param('id');
	const body = await c.req.json();

	try {
		const result = await AutoReply.getCache({ id: id });
		if (!result)
			return c.json({ success: false, error: 'AutoReply not found' }, 404);

		await result.update(body);
		await result.save();

		return c.json({ success: true, data: result });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// DELETE /api/autoreply/:id - Delete an autoreply
app.delete('/:id', async (c) => {
	const { AutoReply } = getModels(c);
	const id = c.req.param('id');

	try {
		const result = await AutoReply.getCache({ id: id });
		if (!result)
			return c.json({ success: false, error: 'AutoReply not found' }, 404);

		await result.destroy();
		return c.json({ success: true, message: 'AutoReply deleted successfully' });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

module.exports = app;
