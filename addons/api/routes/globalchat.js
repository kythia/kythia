/**
 * @namespace: addons/api/routes/globalchat.js
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

const getModels = (c) => c.get('client').container.models;
const getLogger = (c) => c.get('client').container.logger;

function formatGuild(g) {
	return {
		id: g.guildId,
		globalChannelId: g.globalChannelId,
		webhookId: g.webhookId,
		// never expose webhookToken in list/get
		createdAt: g.createdAt,
		updatedAt: g.updatedAt,
	};
}

// ---------------------------------------------------------------------------
// GET /api/globalchat/list
// List all registered guilds (mirrors external /list)
// ---------------------------------------------------------------------------
app.get('/list', async (c) => {
	const { GlobalChat } = getModels(c);

	try {
		const guilds = await GlobalChat.getAllCache({
			order: [['createdAt', 'DESC']],
		});
		return c.json({
			status: 'ok',
			message: 'Guilds retrieved successfully',
			data: {
				guilds: guilds.map(formatGuild),
				count: guilds.length,
				timestamp: new Date().toISOString(),
			},
		});
	} catch (error) {
		getLogger(c).error('GET /api/globalchat/list error:', error);
		return c.json({ status: 'error', error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// GET /api/globalchat/:guildId
// Get registration info for a single guild
// ---------------------------------------------------------------------------
app.get('/:guildId', async (c) => {
	const { GlobalChat } = getModels(c);
	const { guildId } = c.req.param();

	try {
		const guild = await GlobalChat.getCache({ where: { guildId } });
		if (!guild) {
			return c.json(
				{
					status: 'error',
					error: 'Guild not found in global chat system',
					code: 'GUILD_NOT_FOUND',
					data: { guildId },
				},
				404,
			);
		}
		return c.json({ status: 'ok', data: formatGuild(guild) });
	} catch (error) {
		getLogger(c).error('GET /api/globalchat/:guildId error:', error);
		return c.json({ status: 'error', error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// POST /api/globalchat/add
// Register or update a guild (mirrors external /add)
// Body: { guildId, globalChannelId, webhookId?, webhookToken? }
// ---------------------------------------------------------------------------
app.post('/add', async (c) => {
	const { GlobalChat } = getModels(c);

	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json(
			{ status: 'error', error: 'Invalid JSON body', code: 'INVALID_BODY' },
			400,
		);
	}

	const { guildId, globalChannelId, webhookId, webhookToken } = body;

	if (!guildId || !globalChannelId) {
		return c.json(
			{
				status: 'error',
				error:
					'Missing required fields: guildId and globalChannelId are required',
				code: 'MISSING_REQUIRED_FIELDS',
				data: {
					provided: { guildId: !!guildId, globalChannelId: !!globalChannelId },
					required: ['guildId', 'globalChannelId'],
				},
			},
			400,
		);
	}

	try {
		const existing = await GlobalChat.getCache({ where: { guildId } });

		let operation;
		if (existing) {
			existing.globalChannelId = globalChannelId;
			if (webhookId !== undefined) existing.webhookId = webhookId;
			if (webhookToken !== undefined) existing.webhookToken = webhookToken;
			try {
				await existing.save();
			} catch {
				await existing.save();
			}
			operation = 'updated';
		} else {
			await GlobalChat.create({
				guildId,
				globalChannelId,
				webhookId,
				webhookToken,
			});
			operation = 'created';
		}

		return c.json(
			{
				status: 'ok',
				message: 'Guild added/updated successfully',
				data: {
					guild: { guildId, globalChannelId, webhookId: webhookId || null },
					operation,
					hasWebhook: !!(webhookId && webhookToken),
				},
			},
			operation === 'created' ? 201 : 200,
		);
	} catch (error) {
		getLogger(c).error('POST /api/globalchat/add error:', error);
		return c.json({ status: 'error', error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// DELETE /api/globalchat/remove/:guildId
// Remove a guild from the global chat network (mirrors external /remove/:id)
// ---------------------------------------------------------------------------
app.delete('/remove/:guildId', async (c) => {
	const { GlobalChat } = getModels(c);
	const { guildId } = c.req.param();

	try {
		const guild = await GlobalChat.getCache({ where: { guildId } });
		if (!guild) {
			return c.json(
				{
					status: 'error',
					error: 'Guild not found in global chat system',
					code: 'GUILD_NOT_FOUND',
					data: { guildId },
				},
				404,
			);
		}

		const snapshot = formatGuild(guild);
		try {
			await guild.destroy({ individualHooks: true });
		} catch {
			await guild.destroy();
		}

		return c.json({
			status: 'ok',
			message: 'Guild removed from global chat successfully',
			data: {
				removedGuild: snapshot,
				operation: 'deleted',
				removedAt: new Date().toISOString(),
			},
		});
	} catch (error) {
		getLogger(c).error('DELETE /api/globalchat/remove/:guildId error:', error);
		return c.json({ status: 'error', error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// PATCH /api/globalchat/:guildId/webhook
// Update only the webhook credentials for a guild (used by handleFailedGlobalChat)
// Body: { webhookId, webhookToken, globalChannelId? }
// ---------------------------------------------------------------------------
app.patch('/:guildId/webhook', async (c) => {
	const { GlobalChat } = getModels(c);
	const { guildId } = c.req.param();

	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ status: 'error', error: 'Invalid JSON body' }, 400);
	}

	const { webhookId, webhookToken, globalChannelId } = body;
	if (!webhookId || !webhookToken) {
		return c.json(
			{ status: 'error', error: 'webhookId and webhookToken are required' },
			400,
		);
	}

	try {
		const guild = await GlobalChat.getCache({ where: { guildId } });
		if (!guild) {
			return c.json(
				{
					status: 'error',
					error: 'Guild not found in global chat system',
					code: 'GUILD_NOT_FOUND',
				},
				404,
			);
		}

		guild.webhookId = webhookId;
		guild.webhookToken = webhookToken;
		if (globalChannelId) guild.globalChannelId = globalChannelId;

		try {
			await guild.save();
		} catch {
			await guild.save();
		}

		return c.json({
			status: 'ok',
			message: 'Webhook updated successfully',
			data: formatGuild(guild),
		});
	} catch (error) {
		getLogger(c).error('PATCH /api/globalchat/:guildId/webhook error:', error);
		return c.json({ status: 'error', error: error.message }, 500);
	}
});

module.exports = app;
