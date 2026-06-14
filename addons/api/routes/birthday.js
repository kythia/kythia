/**
 * @namespace: addons/api/routes/birthday.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Hono } = require('hono');
const app = new Hono();

// Helpers
const getBot = (c) => c.get('client');
const getContainer = (c) => getBot(c).container;
const getModels = (c) => getContainer(c).models;

// =============================================================================
// UserBirthday — LIST / GET
// =============================================================================

// GET /api/birthday
// Query: ?guildId, ?userId, ?month, ?day
app.get('/', async (c) => {
	const { UserBirthday } = getModels(c);
	const where = {};

	const guildId = c.req.query('guildId');
	const userId = c.req.query('userId');
	const month = c.req.query('month');
	const day = c.req.query('day');

	if (guildId) where.guildId = guildId;
	if (userId) where.userId = userId;
	if (month) where.month = parseInt(month, 10);
	if (day) where.day = parseInt(day, 10);

	try {
		const data = await UserBirthday.getAllCache({ where });
		return c.json({ success: true, count: data.length, data });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// GET /api/birthday/:id
app.get('/:id', async (c) => {
	const { UserBirthday } = getModels(c);
	const id = c.req.param('id');

	try {
		const birthday = await UserBirthday.getCache({ id: id });
		if (!birthday)
			return c.json({ success: false, error: 'Birthday not found' }, 404);
		return c.json({ success: true, data: birthday });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// UserBirthday — CREATE (upsert)
// =============================================================================

// POST /api/birthday
// Body: { guildId, userId, day, month, year? }
app.post('/', async (c) => {
	const { UserBirthday } = getModels(c);
	const body = await c.req.json();
	const { guildId, userId, day, month, year } = body;

	if (!guildId || !userId || !day || !month) {
		return c.json(
			{
				success: false,
				error: 'Missing required fields: guildId, userId, day, month',
			},
			400,
		);
	}

	try {
		const [record, created] = await UserBirthday.findOrCreateCache({
			where: { guildId, userId },
			defaults: { guildId, userId, day, month, year: year ?? null },
		});

		if (!created) {
			record.day = day;
			record.month = month;
			if (year !== undefined) record.year = year ?? null;
			await record.save();
		}

		return c.json({ success: true, created, data: record });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// UserBirthday — UPDATE
// =============================================================================

// PATCH /api/birthday/:id
// Body: { day?, month?, year? }
app.patch('/:id', async (c) => {
	const { UserBirthday } = getModels(c);
	const id = c.req.param('id');
	const body = await c.req.json();

	try {
		const birthday = await UserBirthday.getCache({ id: id });
		if (!birthday)
			return c.json({ success: false, error: 'Birthday not found' }, 404);

		await birthday.update({
			day: body.day ?? birthday.day,
			month: body.month ?? birthday.month,
			year: 'year' in body ? (body.year ?? null) : birthday.year,
		});

		return c.json({ success: true, data: birthday });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// UserBirthday — DELETE
// =============================================================================

// DELETE /api/birthday/:id
app.delete('/:id', async (c) => {
	const { UserBirthday } = getModels(c);
	const id = c.req.param('id');

	try {
		const birthday = await UserBirthday.getCache({ id: id });
		if (!birthday)
			return c.json({ success: false, error: 'Birthday not found' }, 404);

		await birthday.destroy();
		return c.json({
			success: true,
			message: `Birthday (id=${id}) deleted successfully`,
		});
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// BirthdaySetting — GET / PATCH
// =============================================================================

// GET /api/birthday/settings/:guildId
app.get('/settings/:guildId', async (c) => {
	const { BirthdaySetting } = getModels(c);
	const guildId = c.req.param('guildId');

	try {
		const setting = await BirthdaySetting.getCache({ guildId });
		return c.json({ success: true, data: setting ?? null });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// PATCH /api/birthday/settings/:guildId
// Body: any BirthdaySetting fields (channelId, message, roleId, pingRoleId, showAge, embedColor, bgUrl)
app.patch('/settings/:guildId', async (c) => {
	const { BirthdaySetting } = getModels(c);
	const guildId = c.req.param('guildId');
	const body = await c.req.json();

	const ALLOWED_FIELDS = [
		'channelId',
		'message',
		'roleId',
		'pingRoleId',
		'showAge',
		'embedColor',
		'bgUrl',
	];

	try {
		const [setting, created] = await BirthdaySetting.findOrCreateCache({
			where: { guildId },
			defaults: { guildId },
		});

		const updates = {};
		for (const field of ALLOWED_FIELDS) {
			if (field in body) updates[field] = body[field];
		}

		await setting.update(updates);

		return c.json({ success: true, created, data: setting });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

module.exports = app;
