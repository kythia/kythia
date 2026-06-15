/**
 * @namespace: addons/api/routes/social-alerts.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Hono } = require('hono');
const app = new Hono();

// Helper to get models
const getModels = (c) => c.get('client').container.models;

// GET /api/social-alerts - List all subscriptions (with optional filters)
app.get('/', async (c) => {
	const { SocialAlertSubscription } = getModels(c);
	const guildId = c.req.query('guildId');

	const where = {};
	if (guildId) where.guildId = guildId;

	try {
		const data = await SocialAlertSubscription.getAllCache({ where });
		return c.json({ success: true, count: data.length, data });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// GET /api/social-alerts/:id - Get a single subscription
app.get('/:id', async (c) => {
	const { SocialAlertSubscription } = getModels(c);
	const id = c.req.param('id');

	try {
		const result = await SocialAlertSubscription.getCache({ id: id });
		if (!result)
			return c.json({ success: false, error: 'Subscription not found' }, 404);
		return c.json({ success: true, data: result });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// POST /api/social-alerts - Create a new subscription
app.post('/', async (c) => {
	const { SocialAlertSubscription } = getModels(c);
	const body = await c.req.json();

	if (
		!body.guildId ||
		!body.discordChannelId ||
		!body.youtubeChannelId ||
		!body.platform
	) {
		return c.json(
			{
				success: false,
				error:
					'Missing required fields (guildId, discordChannelId, youtubeChannelId, platform)',
			},
			400,
		);
	}

	try {
		const result = await SocialAlertSubscription.create(body);
		await result.save();
		return c.json({ success: true, data: result });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// PATCH /api/social-alerts/:id - Update a subscription
app.patch('/:id', async (c) => {
	const { SocialAlertSubscription } = getModels(c);
	const id = c.req.param('id');
	const body = await c.req.json();

	try {
		const result = await SocialAlertSubscription.getCache({ id: id });
		if (!result)
			return c.json({ success: false, error: 'Subscription not found' }, 404);

		await result.update(body);
		await result.save();

		return c.json({ success: true, data: result });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// DELETE /api/social-alerts/:id - Delete a subscription
app.delete('/:id', async (c) => {
	const { SocialAlertSubscription } = getModels(c);
	const id = c.req.param('id');

	try {
		const result = await SocialAlertSubscription.getCache({ id: id });
		if (!result)
			return c.json({ success: false, error: 'Subscription not found' }, 404);

		await result.destroy();
		return c.json({
			success: true,
			message: 'Subscription deleted successfully',
		});
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// GET /api/social-alerts/settings/:guildId - Get settings for a guild
app.get('/settings/:guildId', async (c) => {
	const { SocialAlertSetting } = getModels(c);
	const guildId = c.req.param('guildId');

	try {
		const result = await SocialAlertSetting.getCache({ where: { guildId } });
		if (!result)
			return c.json({ success: false, error: 'Setting not found' }, 404);
		return c.json({ success: true, data: result });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// PATCH /api/social-alerts/settings/:guildId - Update settings for a guild
app.patch('/settings/:guildId', async (c) => {
	const { SocialAlertSetting } = getModels(c);
	const guildId = c.req.param('guildId');
	const body = await c.req.json();

	try {
		const [result] = await SocialAlertSetting.getOrCreateCache(
			{ where: { guildId } },
			{ guildId, ...body },
		);
		await result.update(body);

		await result.save();
		return c.json({ success: true, data: result });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

module.exports = app;
