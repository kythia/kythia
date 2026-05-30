/**
 * @namespace: addons/api/routes/activity.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Hono } = require('hono');
const { Op, fn, col, literal } = require('sequelize');

const app = new Hono();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getModels = (c) => c.get('client').container.models;
const getLogger = (c) => c.get('client').container.logger;
// const getHelpers = (c) => c.get('client').container.helpers;

/**
 * Returns the start date string (YYYY-MM-DD) for a given period.
 * Returns null for 'all'.
 *
 * @param {string} period
 * @returns {string|null}
 */
const getPeriodStart = (period) => {
	const now = new Date();
	if (period === 'daily') return now.toISOString().slice(0, 10);
	if (period === 'weekly') {
		const d = new Date(now);
		d.setDate(d.getDate() - 6);
		return d.toISOString().slice(0, 10);
	}
	if (period === 'monthly') {
		const d = new Date(now);
		d.setDate(d.getDate() - 29);
		return d.toISOString().slice(0, 10);
	}
	return null;
};

// ---------------------------------------------------------------------------
// PATCH /api/activity/:guildId/toggle
// Enables or disables activity tracking for a guild
// Body: { enabled: boolean }
// ---------------------------------------------------------------------------
app.patch('/:guildId/toggle', async (c) => {
	const models = getModels(c);
	const { ServerSetting } = models;
	const { guildId } = c.req.param();

	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ error: "Missing or invalid 'enabled' field" }, 400);
	}

	if (typeof body?.enabled !== 'boolean') {
		return c.json({ error: "Missing or invalid 'enabled' field" }, 400);
	}

	try {
		const [setting] = await ServerSetting.findOrCreateWithCache({
			where: { guildId },
			defaults: {
				guildId,
				guildName: guildId,
			},
		});

		setting.activityOn = body.enabled;
		await setting.save();

		return c.json({ success: true, activityOn: setting.activityOn });
	} catch (error) {
		getLogger(c).error(
			`PATCH /api/activity/:guildId/toggle error: ${error.message || error}`,
			{ label: 'api:activity' },
		);
		return c.json({ error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// GET /api/activity/:guildId
// Returns the top-N activity leaderboard for a guild
// Query: { sort?: 'messages' | 'voice', limit?: number, period?: 'all' | 'daily' | 'weekly' | 'monthly' }
// ---------------------------------------------------------------------------
app.get('/:guildId', async (c) => {
	const models = getModels(c);
	const { ActivityStat, ActivityLog } = models;
	const { guildId } = c.req.param();

	const { sort = 'messages', limit = '10', period = 'all' } = c.req.query();

	const sortKey = sort === 'voice' ? 'voice' : 'messages';
	const limitNum = Math.min(25, Math.max(1, parseInt(limit, 10) || 10));
	const orderColumn = sortKey === 'voice' ? 'totalVoiceTime' : 'totalMessages';

	try {
		let rows;

		if (period === 'all') {
			rows = await ActivityStat.getAllCache({
				where: { guildId },
				order: [[orderColumn, 'DESC']],
				limit: limitNum,
			});
		} else {
			const startDate = getPeriodStart(period);
			const logColumn = sortKey === 'voice' ? 'voiceTime' : 'messages';

			rows = await ActivityLog.findAll({
				where: { guildId, date: { [Op.gte]: startDate } },
				attributes: [
					'userId',
					[fn('SUM', col('messages')), 'totalMessages'],
					[fn('SUM', col('voiceTime')), 'totalVoiceTime'],
				],
				group: ['userId'],
				order: [
					[
						literal(
							logColumn === 'voiceTime' ? 'totalVoiceTime' : 'totalMessages',
						),
						'DESC',
					],
				],
				limit: limitNum,
				raw: true,
			});
		}

		const client = c.get('client');
		const { broadcastGetUsers } = require('../../api/helpers/shard');
		const userIds = rows.map((r) => r.userId);
		const cachedUsers = await broadcastGetUsers(client, userIds);
		const userMap = new Map(cachedUsers.map((u) => [u.id, u]));

		const leaderboard = rows.map((row, i) => {
			const userObj = userMap.get(row.userId);
			return {
				rank: i + 1,
				userId: row.userId,
				username: userObj?.username ?? null,
				avatar: userObj?.avatar ?? null,
				totalMessages: row.totalMessages ?? 0,
				totalVoiceTime: row.totalVoiceTime ?? 0,
			};
		});

		return c.json({
			success: true,
			guildId,
			sort: sortKey,
			period,
			leaderboard,
		});
	} catch (error) {
		getLogger(c).error(
			`GET /api/activity/:guildId error: ${error.message || error}`,
			{ label: 'api:activity' },
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// GET /api/activity/:guildId/id/:userId
// Returns the activity stats for a single user in a guild
// Query: { period?: 'all' | 'daily' | 'weekly' | 'monthly' }
// ---------------------------------------------------------------------------
app.get('/:guildId/id/:userId', async (c) => {
	const models = getModels(c);
	const { ActivityStat, ActivityLog } = models;
	const { guildId, userId } = c.req.param();
	const { period = 'all' } = c.req.query();

	try {
		let totalMessages, totalVoiceTime;

		if (period === 'all') {
			const stat = await ActivityStat.getCache({ guildId, userId });
			if (!stat) {
				return c.json({ success: false, error: 'User stats not found' }, 404);
			}
			totalMessages = stat.totalMessages ?? 0;
			totalVoiceTime = stat.totalVoiceTime ?? 0;
		} else {
			const startDate = getPeriodStart(period);
			const [row] = await ActivityLog.findAll({
				where: { guildId, userId, date: { [Op.gte]: startDate } },
				attributes: [
					[fn('SUM', col('messages')), 'totalMessages'],
					[fn('SUM', col('voiceTime')), 'totalVoiceTime'],
				],
				raw: true,
			});
			totalMessages = row?.totalMessages ?? 0;
			totalVoiceTime = row?.totalVoiceTime ?? 0;
		}

		const client = c.get('client');
		const { broadcastGetUsers } = require('../../api/helpers/shard');
		const cachedUsers = await broadcastGetUsers(client, [userId]);
		const userObj = cachedUsers[0];

		const username = userObj?.username ?? null;
		const avatar = userObj?.avatar ?? null;

		return c.json({
			success: true,
			guildId,
			userId,
			username,
			avatar,
			period,
			totalMessages,
			totalVoiceTime,
		});
	} catch (error) {
		getLogger(c).error(
			`GET /api/activity/:guildId/id/:userId error: ${error.message || error}`,
			{ label: 'api:activity' },
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// DELETE /api/activity/:guildId/id/:userId
// Deletes the activity stats record for a single user in a guild
// ---------------------------------------------------------------------------
app.delete('/:guildId/id/:userId', async (c) => {
	const models = getModels(c);
	const { ActivityStat, ActivityLog } = models;
	const { guildId, userId } = c.req.param();

	try {
		const deleted = await ActivityStat.destroyAndClearCache({
			where: { guildId, userId },
		});

		// Also wipe their daily log buckets
		await ActivityLog.destroy({ where: { guildId, userId } });

		if (!deleted) {
			return c.json({ success: false, error: 'User stats not found' }, 404);
		}

		return c.json({ success: true });
	} catch (error) {
		getLogger(c).error(
			`DELETE /api/activity/:guildId/id/:userId error: ${error.message || error}`,
			{ label: 'api:activity' },
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// DELETE /api/activity/:guildId
// Wipes all activity stats for every member in a guild
// ---------------------------------------------------------------------------
app.delete('/:guildId', async (c) => {
	const models = getModels(c);
	const { ActivityStat, ActivityLog } = models;
	const { guildId } = c.req.param();

	try {
		const deleted = await ActivityStat.destroyAndClearCache({
			where: { guildId },
		});

		// Also wipe all daily log buckets for the guild
		await ActivityLog.destroy({ where: { guildId } });

		return c.json({ success: true, deleted });
	} catch (error) {
		getLogger(c).error(
			`DELETE /api/activity/:guildId error: ${error.message || error}`,
			{ label: 'api:activity' },
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

module.exports = app;
