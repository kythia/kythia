/**
 * @namespace: addons/api/routes/invite.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { Hono } = require('hono');
const app = new Hono();

const getClient = (c) => c.get('client');
const getModels = (c) => getClient(c).container.models;
// const getHelpers = (c) => getClient(c).container.helpers;

// =============================================================================
// INVITE SETTINGS (/api/invite/settings/:guildId)
// =============================================================================

// GET /api/invite/settings/:guildId — Get invite settings for a guild
app.get('/settings/:guildId', async (c) => {
	const { InviteSetting, ServerSetting } = getModels(c);
	const guildId = c.req.param('guildId');

	try {
		const [setting, serverSetting] = await Promise.all([
			InviteSetting.getCache({ where: { guildId } }),
			ServerSetting.getCache({ guildId }),
		]);

		// Return defaults if either record doesn't exist yet — no 404
		return c.json({
			success: true,
			data: {
				invitesOn: serverSetting?.invitesOn ?? false,
				inviteChannelId: serverSetting?.inviteChannelId ?? null,
				fakeThreshold: setting?.fakeThreshold ?? 7,
				joinMessage: setting?.joinMessage ?? null,
				leaveMessage: setting?.leaveMessage ?? null,
				milestoneRoles: setting?.milestoneRoles ?? [],
				roleStack: setting?.roleStack ?? false,
			},
		});
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// PATCH /api/invite/settings/:guildId — Update invite settings
app.patch('/settings/:guildId', async (c) => {
	const { InviteSetting, ServerSetting } = getModels(c);
	const guildId = c.req.param('guildId');

	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	const INVITE_SETTING_FIELDS = [
		'fakeThreshold',
		'joinMessage',
		'leaveMessage',
		'milestoneRoles',
		'roleStack',
	];

	const SERVER_SETTING_FIELDS = ['inviteChannelId', 'invitesOn'];

	try {
		// Update InviteSetting
		const settingUpdates = {};
		for (const field of INVITE_SETTING_FIELDS) {
			if (Object.hasOwn(body, field)) settingUpdates[field] = body[field];
		}
		if (Object.keys(settingUpdates).length > 0) {
			const [setting] = await InviteSetting.findOrCreate({
				where: { guildId },
				defaults: { guildId },
			});
			await setting.update(settingUpdates);
			await setting.save();
		}

		// Update ServerSetting fields — auto-create if not exists
		const serverUpdates = {};
		for (const field of SERVER_SETTING_FIELDS) {
			if (Object.hasOwn(body, field)) serverUpdates[field] = body[field];
		}
		if (Object.keys(serverUpdates).length > 0) {
			const [serverSetting] = await ServerSetting.findOrCreate({
				where: { guildId },
				defaults: { guildId },
			});
			await serverSetting.update(serverUpdates);
			await serverSetting.save();
		}

		return c.json({ success: true, message: 'Invite settings updated.' });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// INVITE STATS (/api/invite/:guildId)
// =============================================================================

// GET /api/invite/:guildId — Leaderboard (sorted, paginated)
// Query: sort=total|real|fake|bonus|rejoin (default: total), page=1, limit=20
app.get('/:guildId', async (c) => {
	const { Invite } = getModels(c);
	// const { getMemberSafe } = getHelpers(c).discord;
	const guildId = c.req.param('guildId');
	const sort = c.req.query('sort') || 'total';
	const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
	const limit = Math.min(
		100,
		Math.max(1, parseInt(c.req.query('limit') || '20', 10)),
	);
	const offset = (page - 1) * limit;

	const sortColumnMap = {
		real: 'invites',
		fake: 'fake',
		bonus: 'bonus',
		rejoin: 'rejoins',
		total: 'invites',
	};
	const orderCol = sortColumnMap[sort] || 'invites';

	try {
		const { count, rows } = await Invite.findAndCountAll({
			where: { guildId },
			order: [[orderCol, 'DESC']],
			limit,
			offset,
		});

		const client = getClient(c);
		const { broadcastGetUsers } = require('../helpers/shard');
		const userIds = rows.map((r) => r.userId);
		const cachedUsers = await broadcastGetUsers(client, userIds);
		const userMap = new Map(cachedUsers.map((u) => [u.id, u]));

		const data = rows.map((row, i) => {
			const userObj = userMap.get(row.userId);
			return {
				rank: offset + i + 1,
				userId: row.userId,
				username: userObj?.username ?? null,
				avatar: userObj?.avatar ?? null,
				invites: row.invites || 0,
				bonus: row.bonus || 0,
				fake: row.fake || 0,
				leaves: row.leaves || 0,
				rejoins: row.rejoins || 0,
				total: (row.invites || 0) + (row.bonus || 0),
			};
		});

		return c.json({
			success: true,
			count,
			page,
			totalPages: Math.ceil(count / limit),
			data,
		});
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// GET /api/invite/:guildId/user/:userId — Get stats for a specific user
app.get('/:guildId/user/:userId', async (c) => {
	const { Invite, InviteHistory } = getModels(c);
	// const { getMemberSafe } = getHelpers(c).discord;
	const guildId = c.req.param('guildId');
	const userId = c.req.param('userId');

	try {
		const row = await Invite.getCache({ guildId, userId });

		// Compute rank by fetching all inviters sorted by total (invites DESC)
		const allInviters = await Invite.getAllCache({
			where: { guildId },
			order: [['invites', 'DESC']],
			attributes: ['userId', 'invites', 'bonus'],
		});
		const rankPos =
			allInviters.findIndex((r) => r.userId === userId) + 1 ||
			allInviters.length + 1;

		// Who invited this user
		const whoInvited = await InviteHistory.getCache({
			where: { guildId, memberId: userId },
			order: [['createdAt', 'DESC']],
		});

		const client = getClient(c);
		const { broadcastGetUsers } = require('../helpers/shard');
		const cachedUsers = await broadcastGetUsers(client, [userId]);
		const userObj = cachedUsers[0];

		const username = userObj?.username ?? null;
		const avatar = userObj?.avatar ?? null;

		const userTotal = (row?.invites || 0) + (row?.bonus || 0);

		return c.json({
			success: true,
			data: {
				userId,
				username,
				avatar,
				invites: row?.invites || 0,
				bonus: row?.bonus || 0,
				fake: row?.fake || 0,
				leaves: row?.leaves || 0,
				rejoins: row?.rejoins || 0,
				total: userTotal,
				rank: rankPos,
				totalInviters: allInviters.length,
				invitedBy: whoInvited
					? {
							inviterId: whoInvited.inviterId,
							inviteCode: whoInvited.inviteCode || null,
							joinType: whoInvited.joinType || null,
							joinedAt: whoInvited.createdAt,
						}
					: null,
			},
		});
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// PATCH /api/invite/:guildId/user/:userId — Manually update user invites
// Body: { invites?, bonus?, fake?, leaves?, rejoins? }
app.patch('/:guildId/user/:userId', async (c) => {
	const { Invite } = getModels(c);
	const guildId = c.req.param('guildId');
	const userId = c.req.param('userId');

	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	const ALLOWED = ['invites', 'bonus', 'fake', 'leaves', 'rejoins'];

	try {
		const [row] = await Invite.findOrCreate({
			where: { guildId, userId },
			defaults: {
				guildId,
				userId,
				invites: 0,
				bonus: 0,
				fake: 0,
				leaves: 0,
				rejoins: 0,
			},
		});

		const updates = {};
		for (const field of ALLOWED) {
			if (Object.hasOwn(body, field)) updates[field] = body[field];
		}

		if (Object.keys(updates).length === 0)
			return c.json({ success: false, error: 'No valid fields provided' }, 400);

		await row.update(updates);
		await row.save();

		return c.json({
			success: true,
			data: {
				userId: row.userId,
				invites: row.invites,
				bonus: row.bonus,
				fake: row.fake,
				leaves: row.leaves,
				rejoins: row.rejoins,
				total: (row.invites || 0) + (row.bonus || 0),
			},
		});
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// DELETE /api/invite/:guildId/user/:userId — Reset a specific user's invite stats
app.delete('/:guildId/user/:userId', async (c) => {
	const { Invite } = getModels(c);
	const guildId = c.req.param('guildId');
	const userId = c.req.param('userId');

	try {
		const row = await Invite.getCache({ where: { guildId, userId } });
		if (!row)
			return c.json(
				{ success: false, error: 'User invite record not found' },
				404,
			);

		await row.destroy();
		return c.json({ success: true, message: 'User invite stats reset.' });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// DELETE /api/invite/:guildId — Reset all invite stats for the guild
app.delete('/:guildId', async (c) => {
	const { Invite } = getModels(c);
	const guildId = c.req.param('guildId');

	try {
		await Invite.destroy({ where: { guildId } });
		return c.json({
			success: true,
			message: 'All invite stats reset for guild.',
		});
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// INVITE HISTORY (/api/invite/:guildId/history)
// =============================================================================

// GET /api/invite/:guildId/history — All history for a guild
// Query: inviterId, memberId, status, joinType, page, limit
app.get('/:guildId/history', async (c) => {
	const { InviteHistory } = getModels(c);
	const guildId = c.req.param('guildId');
	const inviterId = c.req.query('inviterId');
	const memberId = c.req.query('memberId');
	const status = c.req.query('status');
	const joinType = c.req.query('joinType');
	const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
	const limit = Math.min(
		100,
		Math.max(1, parseInt(c.req.query('limit') || '20', 10)),
	);
	const offset = (page - 1) * limit;

	const where = { guildId };
	if (inviterId) where.inviterId = inviterId;
	if (memberId) where.memberId = memberId;
	if (status) where.status = status;
	if (joinType) where.joinType = joinType;

	try {
		const { count, rows } = await InviteHistory.findAndCountAll({
			where,
			order: [['createdAt', 'DESC']],
			limit,
			offset,
		});

		return c.json({
			success: true,
			count,
			page,
			totalPages: Math.ceil(count / limit),
			data: rows.map((r) => ({
				id: r.id,
				guildId: r.guildId,
				inviterId: r.inviterId,
				memberId: r.memberId,
				inviteCode: r.inviteCode || null,
				joinType: r.joinType || 'unknown',
				status: r.status,
				isFake: r.isFake,
				joinedAt: r.createdAt,
				updatedAt: r.updatedAt,
			})),
		});
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// GET /api/invite/:guildId/history/:memberId — History for a specific member
app.get('/:guildId/history/:memberId', async (c) => {
	const { InviteHistory } = getModels(c);
	const guildId = c.req.param('guildId');
	const memberId = c.req.param('memberId');

	try {
		const rows = await InviteHistory.getAllCache({
			where: { guildId, memberId },
			order: [['createdAt', 'DESC']],
		});

		if (!rows.length)
			return c.json(
				{ success: false, error: 'No history found for this member' },
				404,
			);

		return c.json({
			success: true,
			count: rows.length,
			data: rows.map((r) => ({
				id: r.id,
				inviterId: r.inviterId,
				inviteCode: r.inviteCode || null,
				joinType: r.joinType || 'unknown',
				status: r.status,
				isFake: r.isFake,
				joinedAt: r.createdAt,
				updatedAt: r.updatedAt,
			})),
		});
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// DELETE /api/invite/:guildId/history/:id — Delete a specific history record
app.delete('/:guildId/history/:id', async (c) => {
	const { InviteHistory } = getModels(c);
	const id = c.req.param('id');
	const guildId = c.req.param('guildId');

	try {
		const record = await InviteHistory.getCache({ where: { id, guildId } });
		if (!record)
			return c.json({ success: false, error: 'History record not found' }, 404);

		await record.destroy();
		return c.json({ success: true, message: 'History record deleted.' });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// MILESTONES (/api/invite/:guildId/milestones)
// =============================================================================

// GET /api/invite/:guildId/milestones — List milestone roles
app.get('/:guildId/milestones', async (c) => {
	const { InviteSetting } = getModels(c);
	const guildId = c.req.param('guildId');

	try {
		const setting = await InviteSetting.getCache({ where: { guildId } });
		return c.json({
			success: true,
			data: {
				milestoneRoles: setting?.milestoneRoles ?? [],
				roleStack: setting?.roleStack ?? false,
			},
		});
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// POST /api/invite/:guildId/milestones — Add a milestone role
// Body: { invites: number, roleId: string }
app.post('/:guildId/milestones', async (c) => {
	const { InviteSetting } = getModels(c);
	const guildId = c.req.param('guildId');

	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	const { invites, roleId } = body;
	if (!invites || !roleId)
		return c.json({ success: false, error: 'Missing invites or roleId' }, 400);

	try {
		const [setting] = await InviteSetting.findOrCreate({
			where: { guildId },
			defaults: { guildId, milestoneRoles: [] },
		});

		const milestones = Array.isArray(setting.milestoneRoles)
			? [...setting.milestoneRoles]
			: [];

		const exists = milestones.find((m) => m.invites === invites);
		if (exists)
			return c.json(
				{
					success: false,
					error: 'A milestone at that invite count already exists',
				},
				409,
			);

		milestones.push({ invites, roleId });
		milestones.sort((a, b) => a.invites - b.invites);

		setting.milestoneRoles = milestones;
		setting.changed('milestoneRoles', true);
		await setting.save();
		await setting.save();

		return c.json({ success: true, data: { milestoneRoles: milestones } });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// DELETE /api/invite/:guildId/milestones/:invites — Remove milestone by invite threshold
app.delete('/:guildId/milestones/:invites', async (c) => {
	const { InviteSetting } = getModels(c);
	const guildId = c.req.param('guildId');
	const invites = parseInt(c.req.param('invites'), 10);

	try {
		const setting = await InviteSetting.getCache({ where: { guildId } });
		if (!setting)
			return c.json({ success: false, error: 'InviteSetting not found' }, 404);

		const milestones = Array.isArray(setting.milestoneRoles)
			? [...setting.milestoneRoles]
			: [];
		const newMilestones = milestones.filter((m) => m.invites !== invites);

		if (newMilestones.length === milestones.length)
			return c.json(
				{ success: false, error: 'No milestone found at that invite count' },
				404,
			);

		setting.milestoneRoles = newMilestones;
		setting.changed('milestoneRoles', true);
		await setting.save();
		await setting.save();

		return c.json({ success: true, data: { milestoneRoles: newMilestones } });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

module.exports = app;
