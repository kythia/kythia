/**
 * @namespace: addons/api/routes/quest.js
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
// QuestConfig — LIST / GET
// =============================================================================

// GET /api/quest/configs
// Query: ?guildId
app.get('/configs', async (c) => {
	const { QuestConfig } = getModels(c);
	const where = {};

	const guildId = c.req.query('guildId');
	if (guildId) where.guildId = guildId;

	try {
		const data = await QuestConfig.getAllCache({ where });
		return c.json({ success: true, count: data.length, data });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// GET /api/quest/configs/:guildId
app.get('/configs/:guildId', async (c) => {
	const { QuestConfig } = getModels(c);
	const guildId = c.req.param('guildId');

	try {
		const config = await QuestConfig.getCache({ guildId });
		if (!config)
			return c.json({ success: false, error: 'Quest config not found' }, 404);
		return c.json({ success: true, data: config });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// QuestConfig — CREATE / UPSERT
// =============================================================================

// POST /api/quest/configs
// Body: { guildId, channelId, roleId? }
// Mirrors setup.js intent — findOrCreate then update if needed
app.post('/configs', async (c) => {
	const { QuestConfig } = getModels(c);
	const body = await c.req.json();
	const { guildId, channelId, roleId } = body;

	if (!guildId || !channelId) {
		return c.json(
			{ success: false, error: 'Missing required fields: guildId, channelId' },
			400,
		);
	}

	try {
		const [config, created] = await QuestConfig.findOrCreateWithCache({
			where: { guildId },
			defaults: {
				guildId,
				channelId,
				roleId: roleId ?? null,
			},
		});

		// If already exists, update channelId and roleId (re-run equivalent)
		if (!created) {
			await config.update({
				channelId,
				roleId: 'roleId' in body ? (roleId ?? null) : config.roleId,
			});
		}

		return c.json(
			{ success: true, created, data: config },
			created ? 201 : 200,
		);
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// QuestConfig — UPDATE
// =============================================================================

// PATCH /api/quest/configs/:guildId
// Body: { channelId?, roleId? }
app.patch('/configs/:guildId', async (c) => {
	const { QuestConfig } = getModels(c);
	const guildId = c.req.param('guildId');
	const body = await c.req.json();

	try {
		const config = await QuestConfig.getCache({ guildId });
		if (!config)
			return c.json({ success: false, error: 'Quest config not found' }, 404);

		await config.update({
			channelId: body.channelId ?? config.channelId,
			roleId: 'roleId' in body ? (body.roleId ?? null) : config.roleId,
		});
		return c.json({ success: true, data: config });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// QuestConfig — DELETE
// =============================================================================

// DELETE /api/quest/configs/:guildId
app.delete('/configs/:guildId', async (c) => {
	const { QuestConfig } = getModels(c);
	const guildId = c.req.param('guildId');

	try {
		const config = await QuestConfig.getCache({ guildId });
		if (!config)
			return c.json({ success: false, error: 'Quest config not found' }, 404);

		await config.destroy();
		return c.json({
			success: true,
			message: `Quest config for guild (guildId=${guildId}) deleted successfully`,
		});
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// QuestGuildLog — LIST
// =============================================================================

// GET /api/quest/logs
// Query: ?guildId, ?questId
app.get('/logs', async (c) => {
	const { QuestGuildLog } = getModels(c);
	const where = {};

	const guildId = c.req.query('guildId');
	const questId = c.req.query('questId');
	if (guildId) where.guildId = guildId;
	if (questId) where.questId = questId;

	try {
		const data = await QuestGuildLog.getAllCache({
			where,
			order: [['sentAt', 'DESC']],
		});
		return c.json({ success: true, count: data.length, data });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// QuestGuildLog — CREATE
// =============================================================================

// POST /api/quest/logs
// Body: { guildId, questId }
// Uses findOrCreate to respect the unique (guildId, questId) constraint
app.post('/logs', async (c) => {
	const { QuestGuildLog } = getModels(c);
	const body = await c.req.json();
	const { guildId, questId } = body;

	if (!guildId || !questId) {
		return c.json(
			{ success: false, error: 'Missing required fields: guildId, questId' },
			400,
		);
	}

	try {
		const [log, created] = await QuestGuildLog.findOrCreateWithCache({
			where: { guildId, questId },
			defaults: { guildId, questId, sentAt: new Date() },
		});
		return c.json({ success: true, created, data: log }, created ? 201 : 200);
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// QuestGuildLog — DELETE
// =============================================================================

// DELETE /api/quest/logs/:id
app.delete('/logs/:id', async (c) => {
	const { QuestGuildLog } = getModels(c);
	const id = parseInt(c.req.param('id'), 10);

	try {
		const log = await QuestGuildLog.getCache({ id });
		if (!log)
			return c.json({ success: false, error: 'Quest log not found' }, 404);

		await log.destroy();
		return c.json({
			success: true,
			message: `Quest log (id=${id}) deleted successfully`,
		});
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

module.exports = app;
