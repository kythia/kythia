/**
 * @namespace: addons/api/routes/leveling.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Hono } = require('hono');
const {
	calculateLevelAndXp,
	levelUpXp,
} = require('../../../addons/leveling/helpers');
// const { getMemberSafe } = require('../../core/helpers/discord');

const app = new Hono();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getModels = (c) => c.get('client').container.models;
const getLogger = (c) => c.get('client').container.logger;
// const getHelpers = (c) => c.get('client').container.helpers;

/**
 * Get the leveling curve settings for a guild from LevelingSetting.
 */
async function getGuildLevelingConfig(guildId, models) {
	const { LevelingSetting } = models;
	const setting = await LevelingSetting.getCache({ guildId });
	return {
		curve: setting?.levelingCurve || 'linear',
		multiplier:
			typeof setting?.levelingMultiplier === 'number'
				? setting.levelingMultiplier
				: 1.0,
		maxLevel:
			typeof setting?.levelingMaxLevel === 'number'
				? setting.levelingMaxLevel
				: null,
	};
}

/**
 * Compute total XP from level + current xp (needed for xp-add operations).
 */
function getTotalXp(user, curve, multiplier) {
	let totalXp = user.xp;
	for (let i = 1; i < user.level; i++) {
		totalXp += levelUpXp(i, curve, multiplier);
	}
	return totalXp;
}

// ---------------------------------------------------------------------------
// GET /api/leveling/:guildId/settings
// Fetch the leveling settings for a guild
// ---------------------------------------------------------------------------
app.get('/:guildId/settings', async (c) => {
	const models = getModels(c);
	const { LevelingSetting } = models;
	const { guildId } = c.req.param();

	try {
		let setting = await LevelingSetting.getCache({ where: { guildId } });
		if (!setting) setting = {};

		return c.json({ success: true, data: setting });
	} catch (error) {
		getLogger(c).error(
			`GET /api/leveling/:guildId/settings error: ${error.message || error}`,
			{
				label: 'api:leveling',
			},
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// PATCH /api/leveling/:guildId/settings
// Update leveling settings for a guild (upsert)
// ---------------------------------------------------------------------------
app.patch('/:guildId/settings', async (c) => {
	const models = getModels(c);
	const { LevelingSetting } = models;
	const { guildId } = c.req.param();

	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	try {
		let setting = await LevelingSetting.getCache({ where: { guildId } });
		if (!setting) {
			setting = await LevelingSetting.create({ guildId });
		}

		// Allowed writable fields (excludes guildId, timestamps)
		const ALLOWED = new Set([
			// XP gain
			'messageXpEnabled',
			'messageXpMode',
			'messageXpMin',
			'messageXpMax',
			'messageXpCooldown',
			'voiceXpEnabled',
			'voiceXpMin',
			'voiceXpMax',
			'voiceXpCooldown',
			'voiceMinMembers',
			'voiceAntiAfk',
			'reactionXpEnabled',
			'reactionXpAward',
			'reactionXpMin',
			'reactionXpMax',
			'reactionXpCooldown',
			'threadXpEnabled',
			'forumXpEnabled',
			'textInVoiceXpEnabled',
			'slashCommandXpEnabled',
			// Curve & level cap
			'levelingCurve',
			'levelingMultiplier',
			'levelingMaxLevel',
			// Boosters & restrictions
			'xpBoosters',
			'channelBoosters',
			'stackBoosters',
			'noXpChannels',
			'noXpRoles',
			'autoResetXp',
			// Role rewards
			'roleRewards',
			'roleRewardStack',
			// Level-up notification
			'levelingChannelId',
			'levelingMessage',
			'levelingImageEnabled',
			// Visual customization
			'levelingBackgroundUrl',
			'levelingBorderColor',
			'levelingBarColor',
			'levelingUsernameColor',
			'levelingTagColor',
			'levelingAccentColor',
		]);

		const attributes = LevelingSetting.getAttributes();

		for (const key of Object.keys(body)) {
			if (!ALLOWED.has(key)) continue;
			if (!attributes[key]) continue;

			const fieldDef = attributes[key];
			const type = fieldDef.type.key;
			const value = body[key];

			switch (type) {
				case 'BOOLEAN':
					setting[key] = String(value) === 'true' || value === true;
					break;
				case 'INTEGER':
				case 'BIGINT': {
					const parsed = parseInt(value, 10);
					setting[key] = Number.isNaN(parsed) ? null : parsed;
					break;
				}
				case 'FLOAT':
				case 'DOUBLE': {
					const parsed = parseFloat(value);
					setting[key] = Number.isNaN(parsed) ? null : parsed;
					break;
				}
				case 'JSON':
				case 'JSONB':
					setting[key] = typeof value === 'object' ? value : [];
					break;
				default:
					if (value === null || value === undefined) {
						setting[key] = null;
					} else {
						const str = String(value).trim();
						setting[key] = str === '' ? null : str;
					}
					break;
			}
		}

		await setting.save();

		return c.json({ success: true, data: setting });
	} catch (error) {
		getLogger(c).error(
			`PATCH /api/leveling/:guildId/settings error: ${error.message || error}`,
			{
				label: 'api:leveling',
			},
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// GET /api/leveling/:guildId
// Leaderboard — all members sorted by level+xp, with pagination
// ---------------------------------------------------------------------------
app.get('/:guildId', async (c) => {
	const models = getModels(c);
	// const helpers = getHelpers(c);
	const { User } = models;
	const { guildId } = c.req.param();
	const { page = '1', limit = '50' } = c.req.query();

	// const { getMemberSafe } = helpers.discord;

	const pageNum = Math.max(1, parseInt(page, 10) || 1);
	const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
	const offset = (pageNum - 1) * limitNum;

	try {
		const { count, rows } = await User.paginateCache({
			where: { guildId },
			order: [
				['level', 'DESC'],
				['xp', 'DESC'],
			],
			page: pageNum,
			pageSize: limitNum,
		});

		const { curve, multiplier } = await getGuildLevelingConfig(guildId, models);
		const client = c.get('client');
		const { broadcastGetUsers } = require('../../api/helpers/shard');
		const userIds = rows.map((r) => r.userId);
		const cachedUsers = await broadcastGetUsers(client, userIds);
		const userMap = new Map(cachedUsers.map((u) => [u.id, u]));

		const data = rows.map((u, i) => {
			const userObj = userMap.get(u.userId);

			return {
				rank: offset + i + 1,
				userId: u.userId,
				username: userObj?.username ?? null,
				avatar: userObj?.avatar ?? null,
				level: u.level ?? 1,
				xp: u.xp ?? 0,
				xpRequired: levelUpXp(u.level ?? 1, curve, multiplier),
				createdAt: u.createdAt,
				updatedAt: u.updatedAt,
			};
		});

		return c.json({
			success: true,
			count,
			page: pageNum,
			totalPages: Math.ceil(count / limitNum) || 1,
			data,
		});
	} catch (error) {
		getLogger(c).error(
			`GET /api/leveling/:guildId error: ${error.message || error}`,
			{
				label: 'api:leveling',
			},
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// GET /api/leveling/:guildId/:userId
// Single user profile — returns level, xp, rank and next-level XP
// ---------------------------------------------------------------------------
app.get('/:guildId/:userId', async (c) => {
	const models = getModels(c);
	// const helpers = getHelpers(c);
	const { User } = models;
	const { guildId, userId } = c.req.param();

	// const { getMemberSafe } = helpers.discord;

	try {
		const user = await User.getCache({ where: { guildId, userId } });
		if (!user) {
			return c.json(
				{ success: false, error: 'User not found in this guild' },
				404,
			);
		}

		const { curve, multiplier } = await getGuildLevelingConfig(guildId, models);

		// Total members
		const rank = await User.countWithCache({
			where: { guildId },
		});
		const aboveCount = await User.countWithCache({
			where: {
				guildId,
				[require('sequelize').Op.or]: [
					{ level: { [require('sequelize').Op.gt]: user.level } },
					{
						level: user.level,
						xp: { [require('sequelize').Op.gt]: user.xp },
					},
				],
			},
		});

		const client = c.get('client');
		const { broadcastGetUsers } = require('../../api/helpers/shard');
		const cachedUsers = await broadcastGetUsers(client, [user.userId]);
		const userObj = cachedUsers[0];

		const username = userObj?.username ?? null;
		const avatar = userObj?.avatar ?? null;

		return c.json({
			success: true,
			data: {
				userId: user.userId,
				username,
				avatar,
				guildId: user.guildId,
				level: user.level ?? 1,
				xp: user.xp ?? 0,
				xpRequired: levelUpXp(user.level ?? 1, curve, multiplier),
				rank: aboveCount + 1,
				totalMembers: rank,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			},
		});
	} catch (error) {
		getLogger(c).error(
			`GET /api/leveling/:guildId/:userId error: ${error.message || error}`,
			{
				label: 'api:leveling',
			},
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// POST /api/leveling/:guildId/:userId
// Create a user entry (initialize at level 1, xp 0, or custom values)
// Body: { level?, xp? }
// ---------------------------------------------------------------------------
app.post('/:guildId/:userId', async (c) => {
	const models = getModels(c);
	const { User } = models;
	const { guildId, userId } = c.req.param();

	let body = {};
	try {
		body = await c.req.json();
	} catch {}

	// Check if already exists
	const existing = await User.getCache({ where: { guildId, userId } });
	if (existing) {
		return c.json(
			{ success: false, error: 'User already exists in this guild' },
			409,
		);
	}

	const { curve, multiplier, maxLevel } = await getGuildLevelingConfig(
		guildId,
		models,
	);
	const level =
		maxLevel !== null
			? Math.min(Math.max(1, parseInt(body.level, 10) || 1), maxLevel)
			: Math.max(1, parseInt(body.level, 10) || 1);
	const xp = Math.max(0, parseInt(body.xp, 10) || 0);

	try {
		const user = await User.create({ guildId, userId, level, xp });
		return c.json(
			{
				success: true,
				data: {
					userId: user.userId,
					guildId: user.guildId,
					level: user.level,
					xp: user.xp,
					xpRequired: levelUpXp(user.level, curve, multiplier),
					createdAt: user.createdAt,
					updatedAt: user.updatedAt,
				},
			},
			201,
		);
	} catch (error) {
		getLogger(c).error(
			`POST /api/leveling/:guildId/:userId error: ${error.message || error}`,
			{
				label: 'api:leveling',
			},
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// PATCH /api/leveling/:guildId/:userId
// Update a user's level/xp. Supports multiple modes via `action`:
//   "set-level"  — set level directly, reset xp to 0
//   "add-level"  — add N levels to current level, reset xp to 0
//   "set-xp"     — set total XP, recalculate level (like /leveling xp-set)
//   "add-xp"     — add XP to current total, recalculate level (like /leveling xp-add)
// ---------------------------------------------------------------------------
app.patch('/:guildId/:userId', async (c) => {
	const models = getModels(c);
	const { User } = models;
	const { guildId, userId } = c.req.param();

	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	const { action } = body;
	if (
		!action ||
		!['set-level', 'add-level', 'set-xp', 'add-xp'].includes(action)
	) {
		return c.json(
			{
				success: false,
				error:
					'Missing or invalid action. Must be one of: set-level, add-level, set-xp, add-xp',
			},
			400,
		);
	}

	try {
		const user = await User.getCache({ where: { guildId, userId } });
		if (!user) {
			return c.json(
				{ success: false, error: 'User not found in this guild' },
				404,
			);
		}

		const { curve, multiplier, maxLevel } = await getGuildLevelingConfig(
			guildId,
			models,
		);

		if (action === 'set-level') {
			// Body: { action: "set-level", level: number }
			const level = parseInt(body.level, 10);
			if (Number.isNaN(level) || level < 1) {
				return c.json(
					{ success: false, error: 'level must be a positive integer' },
					400,
				);
			}
			user.level = maxLevel !== null ? Math.min(level, maxLevel) : level;
			user.xp = 0;
		} else if (action === 'add-level') {
			// Body: { action: "add-level", level: number }
			const levelToAdd = parseInt(body.level, 10);
			if (Number.isNaN(levelToAdd)) {
				return c.json(
					{ success: false, error: 'level must be an integer' },
					400,
				);
			}
			const newLevel = user.level + levelToAdd;
			user.level =
				maxLevel !== null
					? Math.min(newLevel, maxLevel)
					: Math.max(1, newLevel);
			user.xp = 0;
		} else if (action === 'set-xp') {
			// Body: { action: "set-xp", xp: number }
			const xpToSet = parseInt(body.xp, 10);
			if (Number.isNaN(xpToSet) || xpToSet < 0) {
				return c.json(
					{ success: false, error: 'xp must be a non-negative integer' },
					400,
				);
			}
			const { newLevel, newXp } = calculateLevelAndXp(
				xpToSet,
				curve,
				multiplier,
				maxLevel,
			);
			user.level = newLevel;
			user.xp = newXp;
		} else if (action === 'add-xp') {
			// Body: { action: "add-xp", xp: number }
			const xpToAdd = parseInt(body.xp, 10);
			if (Number.isNaN(xpToAdd)) {
				return c.json({ success: false, error: 'xp must be an integer' }, 400);
			}
			const totalXp = getTotalXp(user, curve, multiplier) + xpToAdd;
			const { newLevel, newXp } = calculateLevelAndXp(
				Math.max(0, totalXp),
				curve,
				multiplier,
				maxLevel,
			);
			user.level = newLevel;
			user.xp = newXp;
		}

		user.changed('level', true);
		user.changed('xp', true);
		try {
			await user.save();
		} catch {
			await user.save();
		}

		return c.json({
			success: true,
			data: {
				userId: user.userId,
				guildId: user.guildId,
				level: user.level,
				xp: user.xp,
				xpRequired: levelUpXp(user.level, curve, multiplier),
				updatedAt: user.updatedAt,
			},
		});
	} catch (error) {
		getLogger(c).error(
			`PATCH /api/leveling/:guildId/:userId error: ${error.message || error}`,
			{
				label: 'api:leveling',
			},
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// DELETE /api/leveling/:guildId/:userId
// Remove a single user's leveling record
// ---------------------------------------------------------------------------
app.delete('/:guildId/:userId', async (c) => {
	const models = getModels(c);
	const { User } = models;
	const { guildId, userId } = c.req.param();

	try {
		const user = await User.getCache({ where: { guildId, userId } });
		if (!user) {
			return c.json(
				{ success: false, error: 'User not found in this guild' },
				404,
			);
		}

		await user.destroy({ individualHooks: true });
		return c.json({
			success: true,
			message: `Leveling data deleted for user ${userId} in guild ${guildId}`,
		});
	} catch (error) {
		getLogger(c).error(
			`DELETE /api/leveling/:guildId/:userId error: ${error.message || error}`,
			{
				label: 'api:leveling',
			},
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// DELETE /api/leveling/:guildId
// Wipe ALL leveling records in a guild (full reset)
// ---------------------------------------------------------------------------
app.delete('/:guildId', async (c) => {
	const models = getModels(c);
	const { User } = models;
	const { guildId } = c.req.param();

	try {
		const deleted = await User.destroyAndClearCache({ where: { guildId } });
		return c.json({
			success: true,
			message: `Reset leveling data for ${deleted} member(s) in guild ${guildId}`,
			deleted,
		});
	} catch (error) {
		getLogger(c).error(
			`DELETE /api/leveling/:guildId error: ${error.message || error}`,
			{
				label: 'api:leveling',
			},
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

module.exports = app;
