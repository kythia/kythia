/**
 * @namespace: addons/api/routes/automod.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Hono } = require('hono');

const app = new Hono();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const { requireVote } = require('../helpers/locks');

app.use('*', async (c, next) => {
	if (c.req.method !== 'GET') {
		return requireVote()(c, next);
	}
	return next();
});

const getModels = (c) => c.get('client').container.models;
const getLogger = (c) => c.get('client').container.logger;

function ensureArray(v) {
	if (Array.isArray(v)) return v;
	if (typeof v === 'string') {
		try {
			return JSON.parse(v);
		} catch {
			return [];
		}
	}
	return [];
}

// settable automod toggle fields
const TOGGLE_FIELDS = [
	'antiInviteOn',
	'antiLinkOn',
	'antiSpamOn',
	'antiBadwordOn',
	'antiMentionOn',
	'antiAllCapsOn',
	'antiEmojiSpamOn',
	'antiZalgoOn',
];

// channel fields
const CHANNEL_FIELDS = ['modLogChannelId', 'auditLogChannelId'];

function formatSettings(s) {
	return {
		guildId: s.guildId,
		toggles: {
			antiInviteOn: s.antiInviteOn,
			antiLinkOn: s.antiLinkOn,
			antiSpamOn: s.antiSpamOn,
			antiBadwordOn: s.antiBadwordOn,
			antiMentionOn: s.antiMentionOn,
			antiAllCapsOn: s.antiAllCapsOn,
			antiEmojiSpamOn: s.antiEmojiSpamOn,
			antiZalgoOn: s.antiZalgoOn,
		},
		channels: {
			modLogChannelId: s.modLogChannelId || null,
			auditLogChannelId: s.auditLogChannelId || null,
		},
		lists: {
			badwords: ensureArray(s.badwords),
			badwordWhitelist: ensureArray(s.badwordWhitelist),
			whitelist: ensureArray(s.whitelist),
			ignoredChannels: ensureArray(s.ignoredChannels),
		},
		updatedAt: s.updatedAt,
	};
}

// ---------------------------------------------------------------------------
// GET /api/automod/:guildId — full automod config snapshot
// ---------------------------------------------------------------------------
app.get('/:guildId', async (c) => {
	const { ServerSetting } = getModels(c);
	const { guildId } = c.req.param();
	try {
		const [setting] = await ServerSetting.findOrCreateWithCache({
			where: { guildId },
			defaults: {
				guildId,
				guildName: guildId,
			},
		});
		return c.json({ status: 'ok', data: formatSettings(setting) });
	} catch (error) {
		getLogger(c).error('GET /api/automod/:guildId error:', error);
		return c.json({ status: 'error', error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// PATCH /api/automod/:guildId — update any automod toggle or channel field
// Body: { antiSpamOn: true, modLogChannelId: "123..." }
// ---------------------------------------------------------------------------
app.patch('/:guildId', async (c) => {
	const { ServerSetting } = getModels(c);
	const { guildId } = c.req.param();

	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ status: 'error', error: 'Invalid JSON body' }, 400);
	}

	const allowedFields = [...TOGGLE_FIELDS, ...CHANNEL_FIELDS];
	const updates = {};
	for (const field of allowedFields) {
		if (field in body) updates[field] = body[field];
	}

	if (Object.keys(updates).length === 0) {
		return c.json(
			{
				status: 'error',
				error: 'No valid fields to update',
				allowed: allowedFields,
			},
			400,
		);
	}

	try {
		const [setting] = await ServerSetting.findOrCreateWithCache({
			where: { guildId },
			defaults: { guildId },
		});
		Object.assign(setting, updates);
		await setting.save();
		return c.json({
			status: 'ok',
			message: 'Settings updated',
			data: formatSettings(setting),
		});
	} catch (error) {
		getLogger(c).error('PATCH /api/automod/:guildId error:', error);
		return c.json({ status: 'error', error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// GET /api/automod/:guildId/badwords — list badwords
// ---------------------------------------------------------------------------
app.get('/:guildId/badwords', async (c) => {
	const { ServerSetting } = getModels(c);
	const { guildId } = c.req.param();
	try {
		const setting = await ServerSetting.getCache({ guildId });
		if (!setting)
			return c.json({ status: 'error', error: 'Guild not found' }, 404);
		const words = ensureArray(setting.badwords);
		return c.json({ status: 'ok', data: { words, count: words.length } });
	} catch (error) {
		return c.json({ status: 'error', error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// POST /api/automod/:guildId/badwords — add words
// Body: { words: ["word1", "word2"] }
// ---------------------------------------------------------------------------
app.post('/:guildId/badwords', async (c) => {
	const { ServerSetting } = getModels(c);
	const { guildId } = c.req.param();
	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ status: 'error', error: 'Invalid JSON body' }, 400);
	}
	const incoming = Array.isArray(body.words)
		? body.words.map((w) => String(w).toLowerCase().trim()).filter(Boolean)
		: [];
	if (!incoming.length)
		return c.json({ status: 'error', error: 'words array is required' }, 400);

	try {
		const [setting] = await ServerSetting.findOrCreateWithCache({
			where: { guildId },
			defaults: { guildId },
		});
		const words = ensureArray(setting.badwords);
		const added = incoming.filter((w) => !words.includes(w));
		const skipped = incoming.filter((w) => words.includes(w));
		words.push(...added);
		setting.badwords = words;
		setting.changed('badwords', true);
		await setting.save();
		return c.json(
			{ status: 'ok', data: { added, skipped, total: words.length } },
			201,
		);
	} catch (error) {
		return c.json({ status: 'error', error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// DELETE /api/automod/:guildId/badwords — remove words or clear all
// Body: { words: ["word1"] } or { clear: true }
// ---------------------------------------------------------------------------
app.delete('/:guildId/badwords', async (c) => {
	const { ServerSetting } = getModels(c);
	const { guildId } = c.req.param();
	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ status: 'error', error: 'Invalid JSON body' }, 400);
	}

	try {
		const [setting] = await ServerSetting.findOrCreateWithCache({
			where: { guildId },
			defaults: { guildId },
		});
		if (body.clear) {
			setting.badwords = [];
			setting.changed('badwords', true);
			await setting.save();
			return c.json({ status: 'ok', message: 'All badwords cleared' });
		}
		const incoming = Array.isArray(body.words)
			? body.words.map((w) => String(w).toLowerCase().trim())
			: [];
		let words = ensureArray(setting.badwords);
		const removed = incoming.filter((w) => words.includes(w));
		words = words.filter((w) => !incoming.includes(w));
		setting.badwords = words;
		setting.changed('badwords', true);
		await setting.save();
		return c.json({ status: 'ok', data: { removed, total: words.length } });
	} catch (error) {
		return c.json({ status: 'error', error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// GET /api/automod/:guildId/whitelist
// ---------------------------------------------------------------------------
app.get('/:guildId/whitelist', async (c) => {
	const { ServerSetting } = getModels(c);
	const { guildId } = c.req.param();
	try {
		const setting = await ServerSetting.getCache({ guildId });
		if (!setting)
			return c.json({ status: 'error', error: 'Guild not found' }, 404);
		const ids = ensureArray(setting.whitelist);
		return c.json({ status: 'ok', data: { ids, count: ids.length } });
	} catch (error) {
		return c.json({ status: 'error', error: error.message }, 500);
	}
});

// POST /api/automod/:guildId/whitelist — Body: { ids: ["userId", "roleId"] }
app.post('/:guildId/whitelist', async (c) => {
	const { ServerSetting } = getModels(c);
	const { guildId } = c.req.param();
	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ status: 'error', error: 'Invalid JSON body' }, 400);
	}
	const incoming = Array.isArray(body.ids)
		? body.ids.map(String).filter(Boolean)
		: [];
	if (!incoming.length)
		return c.json({ status: 'error', error: 'ids array is required' }, 400);
	try {
		const [setting] = await ServerSetting.findOrCreateWithCache({
			where: { guildId },
			defaults: { guildId },
		});
		const ids = ensureArray(setting.whitelist);
		const added = incoming.filter((id) => !ids.includes(id));
		ids.push(...added);
		setting.whitelist = ids;
		setting.changed('whitelist', true);
		await setting.save();
		return c.json({ status: 'ok', data: { added, total: ids.length } }, 201);
	} catch (error) {
		return c.json({ status: 'error', error: error.message }, 500);
	}
});

// DELETE /api/automod/:guildId/whitelist/:id
app.delete('/:guildId/whitelist/:id', async (c) => {
	const { ServerSetting } = getModels(c);
	const { guildId, id } = c.req.param();
	try {
		const [setting] = await ServerSetting.findOrCreateWithCache({
			where: { guildId },
			defaults: { guildId },
		});
		let ids = ensureArray(setting.whitelist);
		if (!ids.includes(id))
			return c.json(
				{ status: 'error', error: 'ID not in whitelist', code: 'NOT_FOUND' },
				404,
			);
		ids = ids.filter((i) => i !== id);
		setting.whitelist = ids;
		setting.changed('whitelist', true);
		await setting.save();
		return c.json({ status: 'ok', data: { removed: id, total: ids.length } });
	} catch (error) {
		return c.json({ status: 'error', error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// GET /api/automod/:guildId/ignored-channels
// ---------------------------------------------------------------------------
app.get('/:guildId/ignored-channels', async (c) => {
	const { ServerSetting } = getModels(c);
	const { guildId } = c.req.param();
	try {
		const setting = await ServerSetting.getCache({ guildId });
		if (!setting)
			return c.json({ status: 'error', error: 'Guild not found' }, 404);
		const channelIds = ensureArray(setting.ignoredChannels);
		return c.json({
			status: 'ok',
			data: { channelIds, count: channelIds.length },
		});
	} catch (error) {
		return c.json({ status: 'error', error: error.message }, 500);
	}
});

// POST /api/automod/:guildId/ignored-channels — Body: { channelIds: ["..."] }
app.post('/:guildId/ignored-channels', async (c) => {
	const { ServerSetting } = getModels(c);
	const { guildId } = c.req.param();
	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ status: 'error', error: 'Invalid JSON body' }, 400);
	}
	const incoming = Array.isArray(body.channelIds)
		? body.channelIds.map(String)
		: [];
	if (!incoming.length)
		return c.json(
			{ status: 'error', error: 'channelIds array is required' },
			400,
		);
	try {
		const [setting] = await ServerSetting.findOrCreateWithCache({
			where: { guildId },
			defaults: { guildId },
		});
		const channelIds = ensureArray(setting.ignoredChannels);
		const added = incoming.filter((id) => !channelIds.includes(id));
		channelIds.push(...added);
		setting.ignoredChannels = channelIds;
		setting.changed('ignoredChannels', true);
		await setting.save();
		return c.json(
			{ status: 'ok', data: { added, total: channelIds.length } },
			201,
		);
	} catch (error) {
		return c.json({ status: 'error', error: error.message }, 500);
	}
});

// DELETE /api/automod/:guildId/ignored-channels/:channelId
app.delete('/:guildId/ignored-channels/:channelId', async (c) => {
	const { ServerSetting } = getModels(c);
	const { guildId, channelId } = c.req.param();
	try {
		const [setting] = await ServerSetting.findOrCreateWithCache({
			where: { guildId },
			defaults: { guildId },
		});
		let channelIds = ensureArray(setting.ignoredChannels);
		if (!channelIds.includes(channelId))
			return c.json(
				{
					status: 'error',
					error: 'Channel not in ignored list',
					code: 'NOT_FOUND',
				},
				404,
			);
		channelIds = channelIds.filter((id) => id !== channelId);
		setting.ignoredChannels = channelIds;
		setting.changed('ignoredChannels', true);
		await setting.save();
		return c.json({
			status: 'ok',
			data: { removed: channelId, total: channelIds.length },
		});
	} catch (error) {
		return c.json({ status: 'error', error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// GET /api/automod/:guildId/logs — paginated mod logs
// Query: ?page=1&limit=25&action=&targetId=&moderatorId=
// ---------------------------------------------------------------------------
app.get('/:guildId/logs', async (c) => {
	const { ModLog } = getModels(c);
	const { guildId } = c.req.param();
	const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
	const limit = Math.min(
		100,
		Math.max(1, parseInt(c.req.query('limit') || '25', 10)),
	);
	const offset = (page - 1) * limit;

	const where = { guildId };
	const { action, targetId, moderatorId } = c.req.query();
	if (action) where.action = action;
	if (targetId) where.targetId = targetId;
	if (moderatorId) where.moderatorId = moderatorId;

	try {
		const { count, rows } = await ModLog.paginateCache({
			where,
			order: [['createdAt', 'DESC']],
			page,
			pageSize: limit,
		});
		return c.json({
			status: 'ok',
			data: {
				logs: rows.map((l) => (l.toJSON ? l.toJSON() : l.dataValues)),
				pagination: {
					total: count,
					page,
					limit,
					totalPages: Math.ceil(count / limit),
					hasNext: offset + limit < count,
					hasPrev: page > 1,
				},
			},
		});
	} catch (error) {
		getLogger(c).error('GET /api/automod/:guildId/logs error:', error);
		return c.json({ status: 'error', error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// GET /api/automod/:guildId/logs/:logId — single log entry
// ---------------------------------------------------------------------------
app.get('/:guildId/logs/:logId', async (c) => {
	const { ModLog } = getModels(c);
	const { guildId, logId } = c.req.param();
	try {
		const log = await ModLog.getCache({ where: { id: logId, guildId } });
		if (!log)
			return c.json(
				{ status: 'error', error: 'Log entry not found', code: 'NOT_FOUND' },
				404,
			);
		return c.json({
			status: 'ok',
			data: log.toJSON ? log.toJSON() : log.dataValues,
		});
	} catch (error) {
		return c.json({ status: 'error', error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// DELETE /api/automod/:guildId/logs/:logId — delete one log
// ---------------------------------------------------------------------------
app.delete('/:guildId/logs/:logId', async (c) => {
	const { ModLog } = getModels(c);
	const { guildId, logId } = c.req.param();
	try {
		const log = await ModLog.getCache({ where: { id: logId, guildId } });
		if (!log)
			return c.json(
				{ status: 'error', error: 'Log entry not found', code: 'NOT_FOUND' },
				404,
			);
		await log.destroy();
		return c.json({
			status: 'ok',
			message: 'Log entry deleted',
			data: { deletedId: logId },
		});
	} catch (error) {
		return c.json({ status: 'error', error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// DELETE /api/automod/:guildId/logs — clear all (or filtered) logs
// Query: ?action=Automod+Warning  (optional filter)
// ---------------------------------------------------------------------------
app.delete('/:guildId/logs', async (c) => {
	const { ModLog } = getModels(c);
	const { guildId } = c.req.param();
	const { action } = c.req.query();
	const where = { guildId };
	if (action) where.action = action;
	try {
		const deleted = await ModLog.destroyAndClearCache({ where });
		return c.json({
			status: 'ok',
			message: `Deleted ${deleted} log entries`,
			data: { deleted },
		});
	} catch (error) {
		return c.json({ status: 'error', error: error.message }, 500);
	}
});

// ===========================================================================
// ANTINUKE
// ===========================================================================

const {
	getAntiNukeConfig,
	serializeConfig,
} = require('../../automod/helpers/antinuke');

// Helper: load + save antinuke config
async function getANConfig(c) {
	const { ServerSetting } = getModels(c);
	const { guildId } = c.req.param();
	const [setting] = await ServerSetting.findOrCreateWithCache({
		where: { guildId },
		defaults: { guildId },
	});
	const config = getAntiNukeConfig(setting);
	return { setting, config, guildId };
}

async function saveANConfig(setting, config) {
	setting.antiNukeConfig = serializeConfig(config);
	setting.changed('antiNukeConfig', true);
	await setting.save();
}

function formatANConfig(config) {
	return {
		enabled: config.enabled,
		logChannelId: config.logChannelId || null,
		whitelistedUsers: config.whitelistedUsers || [],
		whitelistedRoles: config.whitelistedRoles || [],
		modules: config.modules || {},
	};
}

// ---------------------------------------------------------------------------
// GET /api/automod/:guildId/antinuke — full antinuke config
// ---------------------------------------------------------------------------
app.get('/:guildId/antinuke', async (c) => {
	try {
		const { config } = await getANConfig(c);
		return c.json({ status: 'ok', data: formatANConfig(config) });
	} catch (error) {
		getLogger(c).error('GET antinuke error:', error);
		return c.json({ status: 'error', error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// PUT /api/automod/:guildId/antinuke — replace full config
// Body: { enabled, logChannelId, whitelistedUsers, whitelistedRoles, modules }
// ---------------------------------------------------------------------------
app.put('/:guildId/antinuke', async (c) => {
	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ status: 'error', error: 'Invalid JSON' }, 400);
	}
	try {
		const { setting, config } = await getANConfig(c);
		if (typeof body.enabled === 'boolean') config.enabled = body.enabled;
		if (body.logChannelId !== undefined)
			config.logChannelId = body.logChannelId || null;
		if (Array.isArray(body.whitelistedUsers))
			config.whitelistedUsers = body.whitelistedUsers.map(String);
		if (Array.isArray(body.whitelistedRoles))
			config.whitelistedRoles = body.whitelistedRoles.map(String);
		if (body.modules && typeof body.modules === 'object')
			config.modules = body.modules;
		await saveANConfig(setting, config);
		return c.json({ status: 'ok', data: formatANConfig(config) });
	} catch (error) {
		getLogger(c).error('PUT antinuke error:', error);
		return c.json({ status: 'error', error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// PATCH /api/automod/:guildId/antinuke/toggle — enable or disable antinuke
// Body: { enabled: true }
// ---------------------------------------------------------------------------
app.patch('/:guildId/antinuke/toggle', async (c) => {
	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ status: 'error', error: 'Invalid JSON' }, 400);
	}
	if (typeof body.enabled !== 'boolean')
		return c.json(
			{ status: 'error', error: '"enabled" (boolean) is required' },
			400,
		);
	try {
		const { setting, config } = await getANConfig(c);
		config.enabled = body.enabled;
		await saveANConfig(setting, config);
		return c.json({ status: 'ok', data: { enabled: config.enabled } });
	} catch (error) {
		return c.json({ status: 'error', error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// PATCH /api/automod/:guildId/antinuke/log-channel — set log channel
// Body: { channelId: "..." | null }
// ---------------------------------------------------------------------------
app.patch('/:guildId/antinuke/log-channel', async (c) => {
	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ status: 'error', error: 'Invalid JSON' }, 400);
	}
	try {
		const { setting, config } = await getANConfig(c);
		config.logChannelId = body.channelId || null;
		await saveANConfig(setting, config);
		return c.json({
			status: 'ok',
			data: { logChannelId: config.logChannelId },
		});
	} catch (error) {
		return c.json({ status: 'error', error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// GET /api/automod/:guildId/antinuke/modules — list all modules
// ---------------------------------------------------------------------------
app.get('/:guildId/antinuke/modules', async (c) => {
	try {
		const { config } = await getANConfig(c);
		return c.json({ status: 'ok', data: config.modules || {} });
	} catch (error) {
		return c.json({ status: 'error', error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// PATCH /api/automod/:guildId/antinuke/modules/:module — update one module
// Body: { enabled, action, threshold, window }
// ---------------------------------------------------------------------------
app.patch('/:guildId/antinuke/modules/:module', async (c) => {
	const { module: moduleName } = c.req.param();
	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ status: 'error', error: 'Invalid JSON' }, 400);
	}
	try {
		const { setting, config } = await getANConfig(c);
		if (!config.modules[moduleName]) {
			config.modules[moduleName] = { enabled: false, action: 'kick' };
		}
		const mod = config.modules[moduleName];
		if (typeof body.enabled === 'boolean') mod.enabled = body.enabled;
		if (body.action) mod.action = body.action;
		if (typeof body.threshold === 'number') mod.threshold = body.threshold;
		if (typeof body.window === 'number') mod.window = body.window;
		await saveANConfig(setting, config);
		return c.json({ status: 'ok', data: { module: moduleName, ...mod } });
	} catch (error) {
		return c.json({ status: 'error', error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// GET /api/automod/:guildId/antinuke/whitelist — get whitelisted users + roles
// ---------------------------------------------------------------------------
app.get('/:guildId/antinuke/whitelist', async (c) => {
	try {
		const { config } = await getANConfig(c);
		return c.json({
			status: 'ok',
			data: {
				users: config.whitelistedUsers || [],
				roles: config.whitelistedRoles || [],
			},
		});
	} catch (error) {
		return c.json({ status: 'error', error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// POST /api/automod/:guildId/antinuke/whitelist — add to whitelist
// Body: { type: "user"|"role", id: "..." }
// ---------------------------------------------------------------------------
app.post('/:guildId/antinuke/whitelist', async (c) => {
	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ status: 'error', error: 'Invalid JSON' }, 400);
	}
	if (!body.id || !['user', 'role'].includes(body.type)) {
		return c.json(
			{ status: 'error', error: '"id" and "type" (user|role) are required' },
			400,
		);
	}
	try {
		const { setting, config } = await getANConfig(c);
		const key = body.type === 'role' ? 'whitelistedRoles' : 'whitelistedUsers';
		if (!Array.isArray(config[key])) config[key] = [];
		if (!config[key].includes(body.id)) config[key].push(String(body.id));
		await saveANConfig(setting, config);
		return c.json(
			{ status: 'ok', data: { added: body.id, type: body.type } },
			201,
		);
	} catch (error) {
		return c.json({ status: 'error', error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// DELETE /api/automod/:guildId/antinuke/whitelist/:type/:id — remove from whitelist
// :type = user | role
// ---------------------------------------------------------------------------
app.delete('/:guildId/antinuke/whitelist/:type/:id', async (c) => {
	const { type, id } = c.req.param();
	if (!['user', 'role'].includes(type)) {
		return c.json(
			{ status: 'error', error: 'type must be "user" or "role"' },
			400,
		);
	}
	try {
		const { setting, config } = await getANConfig(c);
		const key = type === 'role' ? 'whitelistedRoles' : 'whitelistedUsers';
		if (!Array.isArray(config[key]) || !config[key].includes(id)) {
			return c.json(
				{ status: 'error', error: 'ID not in whitelist', code: 'NOT_FOUND' },
				404,
			);
		}
		config[key] = config[key].filter((i) => i !== id);
		await saveANConfig(setting, config);
		return c.json({ status: 'ok', data: { removed: id, type } });
	} catch (error) {
		return c.json({ status: 'error', error: error.message }, 500);
	}
});

module.exports = app;
