/**
 * @namespace: addons/api/routes/ai.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Hono } = require('hono');
const UserFactsManager = require('../../../addons/ai/helpers/UserFactsManager');

const app = new Hono();

// Helper to access models from request context
const getModels = (c) => c.get('client').container.models;
const getLogger = (c) => c.get('client').container.logger;

const VALID_PERSONALITIES = [
	'default',
	'friendly',
	'professional',
	'humorous',
	'technical',
	'casual',
];

// ---------------------------------------------------------------------------
// Facts
// ---------------------------------------------------------------------------

/**
 * GET /api/ai/facts/:userId
 * List all facts for a user.
 * Query: ?type=<type>&page=<n>&limit=<n>
 */
app.get('/facts/:userId', async (c) => {
	const { UserFact } = getModels(c);
	const { userId } = c.req.param();
	const { type, page = '1', limit = '50' } = c.req.query();

	const pageNum = Math.max(1, parseInt(page, 10) || 1);
	const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
	const offset = (pageNum - 1) * limitNum;

	try {
		const where = { userId };
		if (type) where.type = type;

		const { count, rows } = await UserFact.findAndCountAll({
			where,
			order: [['createdAt', 'DESC']],
			limit: limitNum,
			offset,
		});

		const totalPages = Math.ceil(count / limitNum) || 1;

		return c.json({
			success: true,
			count,
			page: pageNum,
			totalPages,
			data: rows,
		});
	} catch (error) {
		getLogger(c).error('GET /api/ai/facts/:userId error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * POST /api/ai/facts/:userId
 * Add a new fact for a user.
 * Body: { fact: string, type?: string }
 */
app.post('/facts/:userId', async (c) => {
	const { UserFact } = getModels(c);
	const { userId } = c.req.param();

	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	const { fact, type } = body;
	if (!fact || typeof fact !== 'string' || !fact.trim()) {
		return c.json(
			{ success: false, error: 'Missing or empty required field: fact' },
			400,
		);
	}

	// If no type provided, auto-classify
	const manager = new UserFactsManager({
		UserFact,
		logger: getLogger(c),
		config: {},
	});
	const resolvedType = type || manager.classifyFact(fact.trim());

	try {
		const [factInstance, created] = await UserFact.findOrCreate({
			where: { userId, fact: fact.trim() },
			defaults: { userId, fact: fact.trim(), type: resolvedType },
		});

		if (!created) {
			return c.json(
				{
					success: false,
					error: 'Duplicate fact already exists',
					data: factInstance,
				},
				409,
			);
		}

		return c.json({ success: true, data: factInstance }, 201);
	} catch (error) {
		getLogger(c).error('POST /api/ai/facts/:userId error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * DELETE /api/ai/facts/:userId/:factId
 * Delete a single fact by its primary key.
 */
app.delete('/facts/:userId/:factId', async (c) => {
	const { UserFact } = getModels(c);
	const { userId, factId } = c.req.param();

	try {
		const fact = await UserFact.getCache({ where: { id: factId, userId } });
		if (!fact) {
			return c.json({ success: false, error: 'Fact not found' }, 404);
		}

		await fact.destroy({ individualHooks: true });
		return c.json({ success: true, message: 'Fact deleted successfully' });
	} catch (error) {
		getLogger(c).error('DELETE /api/ai/facts/:userId/:factId error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * DELETE /api/ai/facts/:userId
 * Clear ALL facts for a user.
 */
app.delete('/facts/:userId', async (c) => {
	const { UserFact } = getModels(c);
	const { userId } = c.req.param();

	try {
		const deleted = await UserFact.destroy({ where: { userId } });
		return c.json({
			success: true,
			message: `Deleted ${deleted} fact(s) for user ${userId}`,
			deleted,
		});
	} catch (error) {
		getLogger(c).error('DELETE /api/ai/facts/:userId error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// Personality
// ---------------------------------------------------------------------------

/**
 * GET /api/ai/personality/:userId
 * Get the current personality setting for a user.
 */
app.get('/personality/:userId', async (c) => {
	const { KythiaUser } = getModels(c);
	const { userId } = c.req.param();

	try {
		const user = await KythiaUser.getCache({ where: { userId } });
		const personality = user?.aiPersonality || 'default';

		return c.json({
			success: true,
			data: {
				userId,
				personality,
				availablePersonalities: VALID_PERSONALITIES,
			},
		});
	} catch (error) {
		getLogger(c).error('GET /api/ai/personality/:userId error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * PATCH /api/ai/personality/:userId
 * Set personality for a user.
 * Body: { personality: string }
 */
app.patch('/personality/:userId', async (c) => {
	const { KythiaUser } = getModels(c);
	const { userId } = c.req.param();

	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	const { personality } = body;
	if (!personality || !VALID_PERSONALITIES.includes(personality)) {
		return c.json(
			{
				success: false,
				error: `Invalid personality. Must be one of: ${VALID_PERSONALITIES.join(', ')}`,
			},
			400,
		);
	}

	try {
		const [user] = await KythiaUser.findOrCreate({
			where: { userId },
			defaults: { userId },
		});

		// 'default' is stored as null to fall back to the config default
		user.aiPersonality = personality === 'default' ? null : personality;
		await user.save();

		return c.json({
			success: true,
			data: {
				userId,
				personality: user.aiPersonality ?? 'default',
			},
		});
	} catch (error) {
		getLogger(c).error('PATCH /api/ai/personality/:userId error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * DELETE /api/ai/personality/:userId
 * Reset personality to default (null).
 */
app.delete('/personality/:userId', async (c) => {
	const { KythiaUser } = getModels(c);
	const { userId } = c.req.param();

	try {
		const user = await KythiaUser.getCache({ where: { userId } });
		if (!user) {
			// Nothing to reset — return success anyway
			return c.json({
				success: true,
				message: 'Personality already at default (user not found)',
				data: { userId, personality: 'default' },
			});
		}

		user.aiPersonality = null;
		await user.save();

		return c.json({
			success: true,
			message: 'Personality reset to default',
			data: { userId, personality: 'default' },
		});
	} catch (error) {
		getLogger(c).error('DELETE /api/ai/personality/:userId error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// Opt-Out
// ---------------------------------------------------------------------------

/**
 * GET /api/ai/opt-out/:userId
 * Get the global AI opt-out status for a user.
 */
app.get('/opt-out/:userId', async (c) => {
	const { KythiaUser } = getModels(c);
	const { userId } = c.req.param();

	try {
		const user = await KythiaUser.getCache({ userId });
		return c.json({
			success: true,
			data: {
				userId,
				isAiOptOut: user ? user.isAiOptOut : false,
			},
		});
	} catch (error) {
		getLogger(c).error('GET /api/ai/opt-out/:userId error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * PATCH /api/ai/opt-out/:userId
 * Set the global AI opt-out status for a user.
 * Body: { isAiOptOut: boolean }
 */
app.patch('/opt-out/:userId', async (c) => {
	const { KythiaUser, UserFact } = getModels(c);
	const { userId } = c.req.param();

	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	const { isAiOptOut } = body;
	if (typeof isAiOptOut !== 'boolean') {
		return c.json(
			{ success: false, error: 'isAiOptOut must be a boolean' },
			400,
		);
	}

	try {
		// Upsert the record for this user globally and automatically manage cache
		await KythiaUser.updateOrCreateCache({ userId }, { isAiOptOut });

		// If opting out, clear their facts
		if (isAiOptOut && UserFact) {
			await UserFact.destroy({ where: { userId } });
		}

		return c.json({
			success: true,
			data: {
				userId,
				isAiOptOut,
			},
		});
	} catch (error) {
		getLogger(c).error('PATCH /api/ai/opt-out/:userId error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

module.exports = app;
