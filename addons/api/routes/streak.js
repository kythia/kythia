/**
 * @namespace: addons/api/routes/streak.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { Hono } = require('hono');

const app = new Hono();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getModels = (c) => c.get('client').container.models;
const getLogger = (c) => c.get('client').container.logger;

/**
 * Get the streak timezone configured for a guild.
 * Falls back to process.env.TZ (set from kythia.config), then UTC.
 * @param {import('hono').Context} c
 * @param {string} guildId
 * @returns {Promise<string>}
 */
async function getGuildTimezone(c, guildId) {
	try {
		const { ServerSetting } = getModels(c);
		const setting = await ServerSetting.getCache({ guildId });
		return setting?.streakTimezone || process.env.TZ || 'UTC';
	} catch {
		return process.env.TZ || 'UTC';
	}
}

/**
 * Returns the current date string (YYYY-MM-DD) in the given IANA timezone.
 * @param {string} [timezone]
 * @returns {string}
 */
function getTodayDateString(timezone) {
	const tz = timezone || process.env.TZ || 'UTC';
	return new Date().toLocaleDateString('en-CA', { timeZone: tz });
}

/**
 * Returns yesterday's date string (YYYY-MM-DD) in the given IANA timezone.
 * @param {string} [timezone]
 * @returns {string}
 */
function getYesterdayDateString(timezone) {
	const tz = timezone || process.env.TZ || 'UTC';
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	return yesterday.toLocaleDateString('en-CA', { timeZone: tz });
}

/**
 * Resolve claim status for a streak — same logic as helpers/index.js claimStreak
 * Returns { status, streak } without touching Discord member/roles/nickname.
 * @param {object} streak
 * @param {string} [timezone]
 */
function computeClaim(streak, timezone) {
	const today = getTodayDateString(timezone);
	const yesterday = getYesterdayDateString(timezone);
	const lastClaimDateStr = streak.lastClaimTimestamp
		? streak.lastClaimTimestamp.toISOString().slice(0, 10)
		: null;

	if (lastClaimDateStr === today) {
		return { status: 'ALREADY_CLAIMED', streak };
	}

	let status = 'CONTINUE';
	if (lastClaimDateStr !== yesterday && streak.currentStreak > 0) {
		if (streak.streakFreezes > 0) {
			streak.streakFreezes -= 1;
			streak.currentStreak += 1;
			status = 'FREEZE_USED';
		} else {
			streak.currentStreak = 1;
			status = 'RESET';
		}
	} else if (lastClaimDateStr === yesterday) {
		streak.currentStreak += 1;
		status = 'CONTINUE';
	} else {
		streak.currentStreak = 1;
		status = 'NEW';
	}

	if (streak.currentStreak > (streak.highestStreak || 0)) {
		streak.highestStreak = streak.currentStreak;
	}

	streak.lastClaimTimestamp = new Date(today);
	return { status, streak };
}

function formatStreak(s, rank = null, timezone = null) {
	const today = getTodayDateString(timezone);
	const lastClaim = s.lastClaimTimestamp
		? s.lastClaimTimestamp.toISOString().slice(0, 10)
		: null;

	const result = {
		id: s.id,
		userId: s.userId,
		guildId: s.guildId,
		currentStreak: s.currentStreak ?? 0,
		highestStreak: s.highestStreak ?? 0,
		streakFreezes: s.streakFreezes ?? 0,
		lastStreak: s.lastStreak ?? 0,
		lastClaimTimestamp: s.lastClaimTimestamp,
		lastRestoreTimestamp: s.lastRestoreTimestamp ?? null,
		restoreCount: s.restoreCount ?? 0,
		restoreMonthKey: s.restoreMonthKey ?? null,
		claimedToday: lastClaim === today,
		timezone: timezone || process.env.TZ || 'UTC',
		createdAt: s.createdAt,
		updatedAt: s.updatedAt,
	};
	if (rank !== null) result.rank = rank;
	return result;
}

// ---------------------------------------------------------------------------
// GET /api/streak/:guildId
// Leaderboard — sorted by currentStreak desc, highestStreak desc
// ---------------------------------------------------------------------------
app.get('/:guildId', async (c) => {
	const { Streak } = getModels(c);
	// const { getMemberSafe } = getHelpers(c).discord;
	const { guildId } = c.req.param();
	const { page = '1', limit = '50', sort = 'current' } = c.req.query();

	const pageNum = Math.max(1, parseInt(page, 10) || 1);
	const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
	const offset = (pageNum - 1) * limitNum;

	// Sort mode: 'current' (default) or 'highest'
	const order =
		sort === 'highest'
			? [
					['highestStreak', 'DESC'],
					['currentStreak', 'DESC'],
				]
			: [
					['currentStreak', 'DESC'],
					['highestStreak', 'DESC'],
				];

	try {
		const timezone = await getGuildTimezone(c, guildId);
		const { count, rows } = await Streak.findAndCountAll({
			where: { guildId },
			order,
			limit: limitNum,
			offset,
		});

		const client = c.get('client');
		const { broadcastGetUsers } = require('../helpers/shard');
		const userIds = rows.map((r) => r.userId);
		const cachedUsers = await broadcastGetUsers(client, userIds);
		const userMap = new Map(cachedUsers.map((u) => [u.id, u]));
		const today = getTodayDateString(timezone);

		const data = rows.map((s, i) => {
			const userObj = userMap.get(s.userId);
			return {
				rank: offset + i + 1,
				userId: s.userId,
				username: userObj?.username ?? null,
				avatar: userObj?.avatar ?? null,
				currentStreak: s.currentStreak ?? 0,
				highestStreak: s.highestStreak ?? 0,
				streakFreezes: s.streakFreezes ?? 0,
				claimedToday: s.lastClaimTimestamp
					? s.lastClaimTimestamp.toISOString().slice(0, 10) === today
					: false,
				lastClaimTimestamp: s.lastClaimTimestamp,
			};
		});

		return c.json({
			success: true,
			count,
			page: pageNum,
			totalPages: Math.ceil(count / limitNum) || 1,
			sort,
			timezone,
			data,
		});
	} catch (error) {
		getLogger(c).error('GET /api/streak/:guildId error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// GET /api/streak/:guildId/:userId
// Single user streak profile with rank
// ---------------------------------------------------------------------------
app.get('/:guildId/:userId', async (c) => {
	const { Streak } = getModels(c);
	const { guildId, userId } = c.req.param();
	const { Op } = require('sequelize');

	try {
		const timezone = await getGuildTimezone(c, guildId);
		const streak = await Streak.getCache({ where: { guildId, userId } });
		if (!streak) {
			return c.json(
				{
					success: false,
					error: 'Streak not found for this user in this guild',
				},
				404,
			);
		}

		const aboveCount = await Streak.count({
			where: {
				guildId,
				[Op.or]: [
					{ currentStreak: { [Op.gt]: streak.currentStreak } },
					{
						currentStreak: streak.currentStreak,
						highestStreak: { [Op.gt]: streak.highestStreak },
					},
				],
			},
		});
		const totalMembers = await Streak.count({ where: { guildId } });

		const client = c.get('client');
		const { broadcastGetUsers } = require('../helpers/shard');
		const cachedUsers = await broadcastGetUsers(client, [userId]);
		const userObj = cachedUsers[0];

		const username = userObj?.username ?? null;
		const avatar = userObj?.avatar ?? null;

		const formatted = formatStreak(streak, aboveCount + 1, timezone);
		return c.json({
			success: true,
			data: { ...formatted, username, avatar },
			totalMembers,
		});
	} catch (error) {
		getLogger(c).error('GET /api/streak/:guildId/:userId error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// POST /api/streak/:guildId/:userId
// Create/initialize a streak record for a user
// Body (all optional): { currentStreak?, highestStreak?, streakFreezes?, lastClaimTimestamp? }
// ---------------------------------------------------------------------------
app.post('/:guildId/:userId', async (c) => {
	const { Streak } = getModels(c);
	const { guildId, userId } = c.req.param();

	let body = {};
	try {
		body = await c.req.json();
	} catch {}

	const existing = await Streak.getCache({ where: { guildId, userId } });
	if (existing) {
		return c.json(
			{
				success: false,
				error: 'Streak already exists for this user in this guild',
			},
			409,
		);
	}

	try {
		const streak = await Streak.create({
			guildId,
			userId,
			currentStreak: Math.max(0, parseInt(body.currentStreak, 10) || 0),
			highestStreak: Math.max(0, parseInt(body.highestStreak, 10) || 0),
			streakFreezes: Math.max(0, parseInt(body.streakFreezes, 10) || 0),
			lastClaimTimestamp: body.lastClaimTimestamp
				? new Date(body.lastClaimTimestamp)
				: null,
		});
		return c.json({ success: true, data: formatStreak(streak) }, 201);
	} catch (error) {
		getLogger(c).error('POST /api/streak/:guildId/:userId error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// PATCH /api/streak/:guildId/:userId
// Update a streak. Supports action-based or direct field update.
//
// Actions:
//   "claim"           — simulate /streak claim (no Discord side-effects)
//   "reset-streak"    — reset currentStreak to 0, snapshot to lastStreak
//   "restore"         — restore currentStreak from lastStreak (one-time per loss)
//   "set"             — directly set any combination of fields
//   "add-freeze"      — add N streak freeze(s)
//   "remove-freeze"   — remove N streak freeze(s)
// ---------------------------------------------------------------------------
app.patch('/:guildId/:userId', async (c) => {
	const { Streak } = getModels(c);
	const { guildId, userId } = c.req.param();

	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	const { action } = body;
	const validActions = [
		'claim',
		'reset-streak',
		'restore',
		'set',
		'add-freeze',
		'remove-freeze',
	];
	if (!action || !validActions.includes(action)) {
		return c.json(
			{
				success: false,
				error: `Missing or invalid action. Must be one of: ${validActions.join(', ')}`,
			},
			400,
		);
	}

	try {
		const { ServerSetting } = getModels(c);
		const serverSetting = await ServerSetting.getCache({ guildId });
		const timezone = serverSetting?.streakTimezone || process.env.TZ || 'UTC';
		let streak = await Streak.getCache({ where: { guildId, userId } });

		// Auto-create if not found (matches bot behavior with getOrCreateStreak)
		if (!streak) {
			streak = await Streak.create({
				guildId,
				userId,
				currentStreak: 0,
				highestStreak: 0,
				streakFreezes: 0,
				lastClaimTimestamp: null,
			});
		}

		let claimStatus = null;

		if (action === 'claim') {
			// Mirrors /streak claim logic (without Discord role/nickname side-effects)
			const result = await computeClaim(streak, timezone);
			if (result.status === 'ALREADY_CLAIMED') {
				return c.json(
					{
						success: false,
						error: 'Streak already claimed today',
						claimStatus: 'ALREADY_CLAIMED',
						data: formatStreak(streak),
					},
					409,
				);
			}
			claimStatus = result.status;
			streak = result.streak;
		} else if (action === 'reset-streak') {
			// Mirrors /streak reset — snapshot lastStreak before zeroing
			streak.lastStreak = streak.currentStreak ?? 0;
			streak.currentStreak = 0;
			streak.lastClaimTimestamp = null;
			streak.lastRestoreTimestamp = null; // allow one restore after reset
		} else if (action === 'restore') {
			// Restore currentStreak from lastStreak — mirrors /streak restore
			const tz = timezone || process.env.TZ || 'UTC';
			const currentMonthKey = new Date()
				.toLocaleDateString('en-CA', { timeZone: tz })
				.slice(0, 7);
			const restoreQuota =
				typeof serverSetting?.streakRestoreQuota === 'number'
					? serverSetting.streakRestoreQuota
					: 5;

			if (!streak.lastStreak || streak.lastStreak <= 0) {
				return c.json(
					{
						success: false,
						error: 'No streak to restore',
						restoreStatus: 'NO_STREAK_TO_RESTORE',
						restoreQuota,
					},
					409,
				);
			}
			if (streak.lastRestoreTimestamp) {
				return c.json(
					{
						success: false,
						error: 'Streak already restored for this loss',
						restoreStatus: 'ALREADY_RESTORED',
						restoreQuota,
					},
					409,
				);
			}

			if (streak.restoreMonthKey !== currentMonthKey) {
				streak.restoreCount = 0;
				streak.restoreMonthKey = currentMonthKey;
			}

			const usedThisMonth = streak.restoreCount ?? 0;
			if (usedThisMonth >= restoreQuota) {
				return c.json(
					{
						success: false,
						error: 'Monthly restore quota exceeded',
						restoreStatus: 'QUOTA_EXCEEDED',
						restoreQuota,
						restoreCount: usedThisMonth,
					},
					409,
				);
			}

			const restoredCount = streak.lastStreak;
			streak.currentStreak = restoredCount;
			streak.lastStreak = 0;
			streak.lastRestoreTimestamp = new Date();
			streak.lastClaimTimestamp = new Date(getTodayDateString(timezone));
			streak.restoreCount = usedThisMonth + 1;
			streak.restoreMonthKey = currentMonthKey;

			if (streak.currentStreak > (streak.highestStreak || 0)) {
				streak.highestStreak = streak.currentStreak;
			}
		} else if (action === 'set') {
			// Direct field set: { action: "set", currentStreak?, highestStreak?, streakFreezes?, lastClaimTimestamp? }
			if (body.currentStreak !== undefined) {
				const val = parseInt(body.currentStreak, 10);
				if (Number.isNaN(val) || val < 0)
					return c.json(
						{
							success: false,
							error: 'currentStreak must be a non-negative integer',
						},
						400,
					);
				streak.currentStreak = val;
			}
			if (body.highestStreak !== undefined) {
				const val = parseInt(body.highestStreak, 10);
				if (Number.isNaN(val) || val < 0)
					return c.json(
						{
							success: false,
							error: 'highestStreak must be a non-negative integer',
						},
						400,
					);
				streak.highestStreak = val;
			}
			if (body.streakFreezes !== undefined) {
				const val = parseInt(body.streakFreezes, 10);
				if (Number.isNaN(val) || val < 0)
					return c.json(
						{
							success: false,
							error: 'streakFreezes must be a non-negative integer',
						},
						400,
					);
				streak.streakFreezes = val;
			}
			if (body.lastClaimTimestamp !== undefined) {
				streak.lastClaimTimestamp = body.lastClaimTimestamp
					? new Date(body.lastClaimTimestamp)
					: null;
			}
			// Auto-update highestStreak if currentStreak exceeds it
			if (streak.currentStreak > streak.highestStreak) {
				streak.highestStreak = streak.currentStreak;
			}
		} else if (action === 'add-freeze') {
			// { action: "add-freeze", amount: number }
			const amount = Math.max(1, parseInt(body.amount, 10) || 1);
			streak.streakFreezes = (streak.streakFreezes ?? 0) + amount;
		} else if (action === 'remove-freeze') {
			// { action: "remove-freeze", amount: number }
			const amount = Math.max(1, parseInt(body.amount, 10) || 1);
			streak.streakFreezes = Math.max(0, (streak.streakFreezes ?? 0) - amount);
		}

		await streak.save();

		const response = {
			success: true,
			data: formatStreak(streak, null, timezone),
		};
		if (claimStatus) response.claimStatus = claimStatus;
		return c.json(response);
	} catch (error) {
		getLogger(c).error('PATCH /api/streak/:guildId/:userId error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// DELETE /api/streak/:guildId/:userId
// Delete a single user's streak record
// ---------------------------------------------------------------------------
app.delete('/:guildId/:userId', async (c) => {
	const { Streak } = getModels(c);
	const { guildId, userId } = c.req.param();

	try {
		const streak = await Streak.getCache({ where: { guildId, userId } });
		if (!streak) {
			return c.json(
				{
					success: false,
					error: 'Streak not found for this user in this guild',
				},
				404,
			);
		}

		await streak.destroy({ individualHooks: true });
		return c.json({
			success: true,
			message: `Streak deleted for user ${userId} in guild ${guildId}`,
		});
	} catch (error) {
		getLogger(c).error('DELETE /api/streak/:guildId/:userId error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// DELETE /api/streak/:guildId
// Wipe ALL streak records in a guild
// ---------------------------------------------------------------------------
app.delete('/:guildId', async (c) => {
	const { Streak } = getModels(c);
	const { guildId } = c.req.param();

	try {
		const deleted = await Streak.destroy({ where: { guildId } });
		return c.json({
			success: true,
			message: `Deleted ${deleted} streak record(s) in guild ${guildId}`,
			deleted,
		});
	} catch (error) {
		getLogger(c).error('DELETE /api/streak/:guildId error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

module.exports = app;
