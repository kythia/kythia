/**
 * @namespace: addons/api/routes/owner.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Hono } = require('hono');
const { ActivityType, MessageFlags } = require('discord.js');
const { Op } = require('sequelize');
const ownerGuard = require('../helpers/owner-guard');

const app = new Hono();

// ---------------------------------------------------------------------------
// Owner-only middleware
// All routes on this router require:
//   1. Global Bearer token (handled by server.js)
//   2. X-Owner-Id header set to a Discord user ID in kythiaConfig.owner.ids
// ---------------------------------------------------------------------------
app.use('*', ownerGuard());

const getClient = (c) => c.get('client');
const getContainer = (c) => c.get('client').container;
const getModels = (c) => c.get('client').container.models;
const getRedis = (c) => c.get('client').container.redis;
const getLogger = (c) => c.get('client').container.logger;

// =============================================================================
// MAINTENANCE
// =============================================================================

/**
 * GET /api/owner/maintenance
 * Returns the current maintenance mode state.
 */
app.get('/maintenance', async (c) => {
	try {
		const redis = getRedis(c);

		if (redis?.status !== 'ready') {
			return c.json({
				success: true,
				enabled: false,
				reason: null,
				warning: 'Redis is not connected',
			});
		}

		const reason = await redis.get('system:maintenance_mode');
		return c.json({
			success: true,
			enabled: reason !== null,
			reason: reason ?? null,
		});
	} catch (error) {
		getLogger(c).error(
			`GET /api/owner/maintenance error: ${error.message || error}`,
			{
				label: 'api',
			},
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * POST /api/owner/maintenance
 * Toggle maintenance mode on or off.
 * Body: { enabled: boolean, reason?: string }
 */
app.post('/maintenance', async (c) => {
	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	const { enabled, reason = 'System updates' } = body;

	if (typeof enabled !== 'boolean') {
		return c.json(
			{ success: false, error: 'Field `enabled` must be a boolean' },
			400,
		);
	}

	try {
		const redis = getRedis(c);

		if (redis?.status !== 'ready') {
			return c.json(
				{ success: false, error: 'Redis is not connected or unavailable' },
				503,
			);
		}

		if (enabled) {
			await redis.set('system:maintenance_mode', reason);
		} else {
			await redis.del('system:maintenance_mode');
		}

		getLogger(c).info(
			`Maintenance mode ${enabled ? 'enabled' : 'disabled'} via API. ${enabled ? `Reason: ${reason}` : ''}`,
			{ label: 'api' },
		);

		return c.json({
			success: true,
			enabled,
			reason: enabled ? reason : null,
			message: enabled
				? `Maintenance mode enabled. Reason: ${reason}`
				: 'Maintenance mode disabled.',
		});
	} catch (error) {
		getLogger(c).error(
			`POST /api/owner/maintenance error: ${error.message || error}`,
			{
				label: 'api',
			},
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// FLUSH REDIS
// =============================================================================

/**
 * POST /api/owner/flush
 * Flush the entire Redis cache (FLUSHALL).
 */
app.post('/flush', async (c) => {
	try {
		const redis = getRedis(c);

		if (redis?.status !== 'ready') {
			return c.json(
				{ success: false, error: 'Redis is not connected or unavailable' },
				503,
			);
		}

		const sizeBefore = await redis.dbsize();
		const result = await redis.flushall();
		const sizeAfter = await redis.dbsize();

		getLogger(c).info(
			`Redis FLUSHALL triggered via API. Cleared ${sizeBefore} keys.`,
			{
				label: 'api',
			},
		);

		return c.json({
			success: result === 'OK' && sizeAfter === 0,
			result,
			clearedKeys: sizeBefore,
			sizeAfter,
		});
	} catch (error) {
		getLogger(c).error(
			`POST /api/owner/flush error: ${error.message || error}`,
			{
				label: 'api',
			},
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// SERVERS
// =============================================================================

/**
 * GET /api/owner/servers
 * List all guilds the bot is currently in.
 * Query: ?page=<n>&limit=<n>&sort=members|name
 */
app.get('/servers', async (c) => {
	try {
		const client = getClient(c);
		const { page = '1', limit = '20', sort = 'members' } = c.req.query();

		const pageNum = Math.max(1, parseInt(page, 10) || 1);
		const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

		let guilds = [];

		if (client.shard) {
			const results = await client.shard.broadcastEval((c) =>
				c.guilds.cache.map((g) => ({
					id: g.id,
					name: g.name,
					memberCount: g.memberCount,
					icon: g.iconURL() ?? null,
					ownerId: g.ownerId,
				})),
			);
			guilds = results.flat();
		} else {
			guilds = client.guilds.cache.map((g) => ({
				id: g.id,
				name: g.name,
				memberCount: g.memberCount,
				icon: g.iconURL() ?? null,
				ownerId: g.ownerId,
			}));
		}

		if (sort === 'name') {
			guilds.sort((a, b) => a.name.localeCompare(b.name));
		} else {
			guilds.sort((a, b) => b.memberCount - a.memberCount);
		}

		const total = guilds.length;
		const totalPages = Math.max(1, Math.ceil(total / limitNum));
		const offset = (pageNum - 1) * limitNum;
		const data = guilds.slice(offset, offset + limitNum);

		return c.json({
			success: true,
			total,
			page: pageNum,
			totalPages,
			data,
		});
	} catch (error) {
		getLogger(c).error(
			`GET /api/owner/servers error: ${error.message || error}`,
			{
				label: 'api',
			},
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * POST /api/owner/servers/:guildId/leave
 * Force the bot to leave a specific guild.
 */
app.post('/servers/:guildId/leave', async (c) => {
	const { guildId } = c.req.param();

	try {
		const client = getClient(c);
		const { kythiaConfig } = getContainer(c);

		const SAFE_GUILDS = [
			kythiaConfig.bot.mainGuildId,
			kythiaConfig.bot.devGuildId,
		].filter(Boolean);

		if (SAFE_GUILDS.includes(guildId)) {
			return c.json(
				{
					success: false,
					error: `Guild ${guildId} is a protected guild and cannot be left.`,
				},
				403,
			);
		}

		let found = false;
		let guildName = 'Unknown';
		let memberCount = 0;

		if (client.shard) {
			const results = await client.shard.broadcastEval(
				async (c, context) => {
					const g = c.guilds.cache.get(context.guildId);
					if (g) {
						const name = g.name;
						const members = g.memberCount;
						await g.leave();
						return { found: true, name, members };
					}
					return { found: false };
				},
				{ context: { guildId } },
			);
			const hit = results.find((r) => r.found);
			if (hit) {
				found = true;
				guildName = hit.name;
				memberCount = hit.members;
			}
		} else {
			const guild = client.guilds.cache.get(guildId);
			if (guild) {
				found = true;
				guildName = guild.name;
				memberCount = guild.memberCount;
				await guild.leave();
			}
		}

		if (!found) {
			return c.json(
				{ success: false, error: `Guild ${guildId} not found in cache.` },
				404,
			);
		}

		getLogger(c).info(`Left guild ${guildName} (${guildId}) via API.`, {
			label: 'api',
		});

		return c.json({
			success: true,
			message: `Successfully left guild "${guildName}".`,
			guild: { id: guildId, name: guildName, memberCount },
		});
	} catch (error) {
		getLogger(c).error(
			`POST /api/owner/servers/${guildId}/leave error: ${error.message || error}`,
			{
				label: 'api',
			},
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * POST /api/owner/mass-leave
 * Mass leave guilds with member count below a threshold.
 * Body: { minMember: number, except?: string[] }
 */
app.post('/mass-leave', async (c) => {
	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	const { minMember, except = [], customMsg } = body;

	if (typeof minMember !== 'number' || minMember < 1) {
		return c.json(
			{ success: false, error: '`minMember` must be a positive integer' },
			400,
		);
	}

	try {
		const client = getClient(c);
		const { kythiaConfig } = getContainer(c);

		const SAFE_GUILDS = [
			kythiaConfig.bot.mainGuildId,
			kythiaConfig.bot.devGuildId,
			...except,
		].filter(Boolean);

		let leftCount = 0;
		let errorCount = 0;
		const leftNames = [];

		if (client.shard) {
			const results = await client.shard.broadcastEval(
				async (c, context) => {
					const targets = c.guilds.cache.filter(
						(g) =>
							g.memberCount < context.threshold &&
							!context.SAFE_GUILDS.includes(g.id),
					);
					let lCount = 0;
					let eCount = 0;
					const lNames = [];
					for (const [, guild] of targets) {
						try {
							if (context.customMsg) {
								let channel = guild.systemChannel;
								if (!channel) {
									channel = guild.channels.cache.find(
										(ch) =>
											ch.isTextBased() &&
											ch.permissionsFor(guild.members.me).has('SendMessages') &&
											(ch.name.includes('general') ||
												ch.name.includes('chat') ||
												ch.name.includes('obrolan')),
									);
								}
								if (!channel) {
									channel = guild.channels.cache.find(
										(ch) =>
											ch.isTextBased() &&
											ch.permissionsFor(guild.members.me).has('SendMessages'),
									);
								}
								if (channel) {
									await channel
										.send({
											content: context.customMsg,
										})
										.catch(() => null);
								}
							}
							await guild.leave();
							lCount++;
							lNames.push({
								name: guild.name,
								id: guild.id,
								memberCount: guild.memberCount,
							});
							await new Promise((r) => setTimeout(r, 1000));
						} catch {
							eCount++;
						}
					}
					return { leftCount: lCount, errorCount: eCount, leftNames: lNames };
				},
				{ context: { threshold: minMember, SAFE_GUILDS, customMsg } },
			);

			leftCount = results.reduce((acc, r) => acc + r.leftCount, 0);
			errorCount = results.reduce((acc, r) => acc + r.errorCount, 0);
			leftNames.push(...results.flatMap((r) => r.leftNames));
		} else {
			const targets = client.guilds.cache.filter(
				(g) => g.memberCount < minMember && !SAFE_GUILDS.includes(g.id),
			);
			for (const [, guild] of targets) {
				try {
					if (customMsg) {
						let channel = guild.systemChannel;
						if (!channel) {
							channel = guild.channels.cache.find(
								(ch) =>
									ch.isTextBased() &&
									ch.permissionsFor(guild.members.me).has('SendMessages') &&
									(ch.name.includes('general') ||
										ch.name.includes('chat') ||
										ch.name.includes('obrolan')),
							);
						}
						if (!channel) {
							channel = guild.channels.cache.find(
								(ch) =>
									ch.isTextBased() &&
									ch.permissionsFor(guild.members.me).has('SendMessages'),
							);
						}
						if (channel) {
							await channel
								.send({
									content: customMsg,
								})
								.catch(() => null);
						}
					}
					leftNames.push({
						name: guild.name,
						id: guild.id,
						memberCount: guild.memberCount,
					});
					await guild.leave();
					leftCount++;
					await new Promise((r) => setTimeout(r, 1000));
				} catch {
					errorCount++;
				}
			}
		}

		getLogger(c).info(
			`Mass-leave via API: left ${leftCount} guilds below ${minMember} members (${errorCount} errors).`,
			{ label: 'api' },
		);

		return c.json({
			success: true,
			threshold: minMember,
			leftCount,
			errorCount,
			guilds: leftNames,
		});
	} catch (error) {
		getLogger(c).error(
			`POST /api/owner/mass-leave error: ${error.message || error}`,
			{
				label: 'api',
			},
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// BLACKLIST — GUILDS
// =============================================================================

/**
 * GET /api/owner/blacklist/guilds
 * List all blacklisted guilds.
 */
app.get('/blacklist/guilds', async (c) => {
	try {
		const client = getClient(c);
		const { KythiaBlacklist } = getModels(c);
		const entries = await KythiaBlacklist.getAllCache({
			where: { type: 'guild' },
		});

		const guildIds = entries.map((e) => e.targetId);
		let cachedGuilds = [];
		if (guildIds.length > 0) {
			if (client.shard) {
				const results = await client.shard.broadcastEval(
					(c, { ids }) => {
						const localFound = [];
						for (const id of ids) {
							const g = c.guilds.cache.get(id);
							if (g) {
								localFound.push({
									id: g.id,
									name: g.name,
									icon: g.iconURL({ size: 64 }),
								});
							}
						}
						return localFound;
					},
					{ context: { ids: guildIds } },
				);

				const finalMap = new Map();
				for (const shardGuilds of results) {
					for (const g of shardGuilds) {
						if (!finalMap.has(g.id)) {
							finalMap.set(g.id, g);
						}
					}
				}
				cachedGuilds = Array.from(finalMap.values());
			} else {
				for (const id of guildIds) {
					const g = client.guilds.cache.get(id);
					if (g) {
						cachedGuilds.push({
							id: g.id,
							name: g.name,
							icon: g.iconURL({ size: 64 }),
						});
					}
				}
			}
		}

		const guildMap = new Map(cachedGuilds.map((g) => [g.id, g]));

		return c.json({
			success: true,
			total: entries.length,
			data: entries.map((e) => {
				const guildObj = guildMap.get(e.targetId);
				return {
					id: e.id,
					targetId: e.targetId,
					name: guildObj?.name ?? null,
					avatar: guildObj?.icon ?? null,
					reason: e.reason ?? null,
					createdAt: e.createdAt,
				};
			}),
		});
	} catch (error) {
		getLogger(c).error(
			`GET /api/owner/blacklist/guilds error: ${error.message || error}`,
			{
				label: 'api',
			},
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * POST /api/owner/blacklist/guilds
 * Blacklist a guild.
 * Body: { guildId: string, reason?: string }
 */
app.post('/blacklist/guilds', async (c) => {
	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	const { guildId, reason = null } = body;

	if (!guildId || typeof guildId !== 'string') {
		return c.json(
			{ success: false, error: 'Missing or invalid required field: guildId' },
			400,
		);
	}

	try {
		const { KythiaBlacklist } = getModels(c);
		const client = getClient(c);

		const existing = await KythiaBlacklist.getCache({
			where: { type: 'guild', targetId: guildId },
		});
		if (existing) {
			return c.json(
				{ success: false, error: `Guild ${guildId} is already blacklisted.` },
				409,
			);
		}

		await KythiaBlacklist.create({ type: 'guild', targetId: guildId, reason });

		const redis = getRedis(c);
		if (redis && redis.status === 'ready') {
			await redis.del(`kythia:middleware:blacklist:guild:${guildId}`);
		}

		let left = false;
		if (client.shard) {
			const results = await client.shard.broadcastEval(
				async (c, { id }) => {
					const g = c.guilds.cache.get(id);
					if (g) {
						try {
							await g.leave();
							return true;
						} catch {
							return false;
						}
					}
					return false;
				},
				{ context: { id: guildId } },
			);
			left = results.some((r) => r === true);
		} else {
			const targetGuild = client.guilds.cache.get(guildId);
			if (targetGuild) {
				try {
					await targetGuild.leave();
					left = true;
				} catch {}
			}
		}

		getLogger(c).info(
			`Guild ${guildId} blacklisted via API. Reason: ${reason ?? 'none'} | Left: ${left}`,
			{ label: 'api' },
		);

		return c.json(
			{
				success: true,
				data: { guildId, reason: reason ?? null, leftImmediately: left },
			},
			201,
		);
	} catch (error) {
		getLogger(c).error(
			`POST /api/owner/blacklist/guilds error: ${error.message || error}`,
			{
				label: 'api',
			},
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * DELETE /api/owner/blacklist/guilds/:guildId
 * Remove a guild from the blacklist.
 */
app.delete('/blacklist/guilds/:guildId', async (c) => {
	const { guildId } = c.req.param();

	try {
		const { KythiaBlacklist } = getModels(c);

		const existing = await KythiaBlacklist.getCache({
			where: { type: 'guild', targetId: guildId },
		});
		if (!existing) {
			return c.json(
				{ success: false, error: `Guild ${guildId} is not blacklisted.` },
				404,
			);
		}

		await KythiaBlacklist.destroyAndClearCache({
			where: { type: 'guild', targetId: guildId },
		});

		const redis = getRedis(c);
		if (redis && redis.status === 'ready') {
			await redis.del(`kythia:middleware:blacklist:guild:${guildId}`);
		}

		getLogger(c).info(`Guild ${guildId} removed from blacklist via API.`, {
			label: 'api',
		});

		return c.json({
			success: true,
			message: `Guild ${guildId} removed from blacklist.`,
		});
	} catch (error) {
		getLogger(c).error(
			`DELETE /api/owner/blacklist/guilds/${guildId} error: ${error.message || error}`,
			{
				label: 'api',
			},
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// BLACKLIST — USERS
// =============================================================================

/**
 * GET /api/owner/blacklist/users
 * List all blacklisted users.
 */
app.get('/blacklist/users', async (c) => {
	try {
		const client = getClient(c);
		const { KythiaBlacklist } = getModels(c);
		const entries = await KythiaBlacklist.getAllCache({
			where: { type: 'user' },
		});

		const { broadcastGetUsers } = require('../helpers/shard');
		const userIds = entries.map((e) => e.targetId);
		const cachedUsers = await broadcastGetUsers(client, userIds);
		const userMap = new Map(cachedUsers.map((u) => [u.id, u]));

		return c.json({
			success: true,
			total: entries.length,
			data: entries.map((e) => {
				const userObj = userMap.get(e.targetId);
				return {
					id: e.id,
					targetId: e.targetId,
					username: userObj?.username ?? null,
					avatar: userObj?.avatar ?? null,
					reason: e.reason ?? null,
					createdAt: e.createdAt,
				};
			}),
		});
	} catch (error) {
		getLogger(c).error(
			`GET /api/owner/blacklist/users error: ${error.message || error}`,
			{
				label: 'api',
			},
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * POST /api/owner/blacklist/users
 * Blacklist a user.
 * Body: { userId: string, reason?: string }
 */
app.post('/blacklist/users', async (c) => {
	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	const { userId, reason = null } = body;

	if (!userId || typeof userId !== 'string') {
		return c.json(
			{ success: false, error: 'Missing or invalid required field: userId' },
			400,
		);
	}

	try {
		const { KythiaBlacklist } = getModels(c);

		const existing = await KythiaBlacklist.getCache({
			where: { type: 'user', targetId: userId },
		});
		if (existing) {
			return c.json(
				{ success: false, error: `User ${userId} is already blacklisted.` },
				409,
			);
		}

		await KythiaBlacklist.create({ type: 'user', targetId: userId, reason });

		const redis = getRedis(c);
		if (redis && redis.status === 'ready') {
			await redis.del(`kythia:middleware:blacklist:user:${userId}`);
		}

		getLogger(c).info(
			`User ${userId} blacklisted via API. Reason: ${reason ?? 'none'}`,
			{ label: 'api' },
		);

		return c.json(
			{
				success: true,
				data: { userId, reason: reason ?? null },
			},
			201,
		);
	} catch (error) {
		getLogger(c).error(
			`POST /api/owner/blacklist/users error: ${error.message || error}`,
			{
				label: 'api',
			},
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * DELETE /api/owner/blacklist/users/:userId
 * Remove a user from the blacklist.
 */
app.delete('/blacklist/users/:userId', async (c) => {
	const { userId } = c.req.param();

	try {
		const { KythiaBlacklist } = getModels(c);

		const existing = await KythiaBlacklist.getCache({
			where: { type: 'user', targetId: userId },
		});
		if (!existing) {
			return c.json(
				{ success: false, error: `User ${userId} is not blacklisted.` },
				404,
			);
		}

		await KythiaBlacklist.destroyAndClearCache({
			where: { type: 'user', targetId: userId },
		});

		const redis = getRedis(c);
		if (redis && redis.status === 'ready') {
			await redis.del(`kythia:middleware:blacklist:user:${userId}`);
		}

		getLogger(c).info(`User ${userId} removed from blacklist via API.`, {
			label: 'api',
		});

		return c.json({
			success: true,
			message: `User ${userId} removed from blacklist.`,
		});
	} catch (error) {
		getLogger(c).error(
			`DELETE /api/owner/blacklist/users/${userId} error: ${error.message || error}`,
			{
				label: 'api',
			},
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// PREMIUM
// =============================================================================

/**
 * GET /api/owner/premium
 * List all active premium users.
 * Query: ?page=<n>&limit=<n>
 */
app.get('/premium', async (c) => {
	try {
		const { KythiaUser } = getModels(c);
		const { page = '1', limit = '20' } = c.req.query();

		const pageNum = Math.max(1, parseInt(page, 10) || 1);
		const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

		const now = new Date();
		const total = await KythiaUser.countCache({
			where: {
				premiumTier: { [Op.notIn]: ['none'] },
				premiumExpiresAt: { [Op.gt]: now },
			},
		});

		const users = await KythiaUser.getAllCache({
			where: {
				premiumTier: { [Op.notIn]: ['none'] },
				premiumExpiresAt: { [Op.gt]: now },
			},
			order: [['premiumExpiresAt', 'ASC']],
			limit: limitNum,
			offset: (pageNum - 1) * limitNum,
		});

		const client = getClient(c);
		const { broadcastGetUsers } = require('../helpers/shard');
		const userIds = users.map((u) => u.userId);
		const cachedUsers = await broadcastGetUsers(client, userIds);
		const userMap = new Map(cachedUsers.map((u) => [u.id, u]));

		return c.json({
			success: true,
			total,
			page: pageNum,
			totalPages: Math.max(1, Math.ceil(total / limitNum)),
			data: users.map((u) => {
				const userObj = userMap.get(u.userId);
				return {
					userId: u.userId,
					username: userObj?.username ?? null,
					avatar: userObj?.avatar ?? null,
					isPremium: u.premiumTier && u.premiumTier !== 'none',
					premiumTier: u.premiumTier || 'none',
					premiumExpiresAt: u.premiumExpiresAt,
				};
			}),
		});
	} catch (error) {
		getLogger(c).error(
			`GET /api/owner/premium error: ${error.message || error}`,
			{
				label: 'api',
			},
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * GET /api/owner/premium/:userId
 * Get premium status for a specific user.
 */
app.get('/premium/:userId', async (c) => {
	const { userId } = c.req.param();

	try {
		const { KythiaUser } = getModels(c);

		const user = await KythiaUser.getCache({ userId });
		if (!user) {
			return c.json({
				success: true,
				data: {
					userId,
					isPremium: false,
					premiumTier: 'none',
					premiumExpiresAt: null,
				},
			});
		}

		const isActive =
			user.premiumTier &&
			user.premiumTier !== 'none' &&
			user.premiumExpiresAt &&
			new Date(user.premiumExpiresAt) > new Date();

		return c.json({
			success: true,
			data: {
				userId: user.userId,
				isPremium: isActive,
				premiumTier: isActive ? user.premiumTier : 'none',
				premiumExpiresAt: user.premiumExpiresAt ?? null,
			},
		});
	} catch (error) {
		getLogger(c).error(
			`GET /api/owner/premium/${userId} error: ${error.message || error}`,
			{
				label: 'api',
			},
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * POST /api/owner/premium
 * Grant premium to a user.
 * Body: { userId: string, days?: number, tier?: string }
 */
app.post('/premium', async (c) => {
	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	const { userId, days = 30, tier = 'powerful' } = body;

	if (!userId || typeof userId !== 'string') {
		return c.json(
			{ success: false, error: 'Missing or invalid required field: userId' },
			400,
		);
	}
	if (typeof days !== 'number' || days < 1) {
		return c.json(
			{ success: false, error: '`days` must be a positive integer' },
			400,
		);
	}

	try {
		const { KythiaUser } = getModels(c);

		const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

		await KythiaUser.updateOrCreateCache(
			{ userId },
			{
				premiumTier: tier,
				premiumExpiresAt: expiresAt,
			},
		);

		getLogger(c).info(
			`Premium granted to user ${userId} for ${days} days (Tier: ${tier}) via API.`,
			{ label: 'api' },
		);

		return c.json(
			{
				success: true,
				data: { userId, days, tier, premiumExpiresAt: expiresAt },
			},
			201,
		);
	} catch (error) {
		getLogger(c).error(
			`POST /api/owner/premium error: ${error.message || error}`,
			{
				label: 'api',
			},
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * DELETE /api/owner/premium/:userId
 * Revoke premium from a user.
 */
app.delete('/premium/:userId', async (c) => {
	const { userId } = c.req.param();

	try {
		const { KythiaUser } = getModels(c);

		const user = await KythiaUser.getCache({ userId });
		if (!user?.premiumTier || user.premiumTier === 'none') {
			return c.json(
				{ success: false, error: `User ${userId} does not have premium.` },
				404,
			);
		}

		await KythiaUser.updateOrCreateCache(
			{ userId },
			{
				premiumTier: 'none',
				premiumExpiresAt: null,
			},
		);

		getLogger(c).info(`Premium revoked from user ${userId} via API.`, {
			label: 'api',
		});

		return c.json({
			success: true,
			message: `Premium revoked from user ${userId}.`,
		});
	} catch (error) {
		getLogger(c).error(
			`DELETE /api/owner/premium/${userId} error: ${error.message || error}`,
			{
				label: 'api',
			},
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// TEAM
// =============================================================================

/**
 * GET /api/owner/team
 * List all Kythia Team members.
 */
app.get('/team', async (c) => {
	try {
		const { KythiaTeam } = getModels(c);
		const members = await KythiaTeam.getAllCache();
		const client = getClient(c);
		const { broadcastGetUsers } = require('../helpers/shard');
		const userIds = members.map((m) => m.userId);
		const cachedUsers = await broadcastGetUsers(client, userIds);
		const userMap = new Map(cachedUsers.map((u) => [u.id, u]));

		return c.json({
			success: true,
			total: members.length,
			data: members.map((m) => {
				const userObj = userMap.get(m.userId);
				return {
					id: m.id,
					userId: m.userId,
					username: userObj?.username ?? null,
					avatar: userObj?.avatar ?? null,
					name: m.name ?? null,
					createdAt: m.createdAt,
				};
			}),
		});
	} catch (error) {
		getLogger(c).error(`GET /api/owner/team error: ${error.message || error}`, {
			label: 'api',
		});
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * POST /api/owner/team
 * Add a member to Kythia Team.
 * Body: { userId: string, name?: string }
 */
app.post('/team', async (c) => {
	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	const { userId, name = null } = body;

	if (!userId || typeof userId !== 'string') {
		return c.json(
			{ success: false, error: 'Missing or invalid required field: userId' },
			400,
		);
	}

	try {
		const { KythiaTeam } = getModels(c);

		const existing = await KythiaTeam.getCache({ userId });
		if (existing) {
			return c.json(
				{ success: false, error: `User ${userId} is already a team member.` },
				409,
			);
		}

		const member = await KythiaTeam.create({ userId, name });

		getLogger(c).info(
			`User ${userId} added to Kythia Team via API. Role: ${name ?? 'none'}`,
			{
				label: 'api',
			},
		);

		return c.json(
			{
				success: true,
				data: {
					id: member.id,
					userId: member.userId,
					name: member.name ?? null,
				},
			},
			201,
		);
	} catch (error) {
		getLogger(c).error(
			`POST /api/owner/team error: ${error.message || error}`,
			{ label: 'api' },
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * DELETE /api/owner/team/:userId
 * Remove a member from Kythia Team.
 */
app.delete('/team/:userId', async (c) => {
	const { userId } = c.req.param();

	try {
		const { KythiaTeam } = getModels(c);

		const existing = await KythiaTeam.getCache({ userId });
		if (!existing) {
			return c.json(
				{ success: false, error: `User ${userId} is not a team member.` },
				404,
			);
		}

		await KythiaTeam.destroyAndClearCache({ where: { userId } });

		getLogger(c).info(`User ${userId} removed from Kythia Team via API.`, {
			label: 'api',
		});

		return c.json({
			success: true,
			message: `User ${userId} removed from Kythia Team.`,
		});
	} catch (error) {
		getLogger(c).error(
			`DELETE /api/owner/team/${userId} error: ${error.message || error}`,
			{
				label: 'api',
			},
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// PRESENCE
// =============================================================================

/**
 * GET /api/owner/presence
 * Get the bot's current presence (status + activity).
 */
app.get('/presence', (c) => {
	try {
		const client = getClient(c);

		const presence = client.user?.presence;
		if (!presence) {
			return c.json({ success: false, error: 'Bot presence unavailable' }, 503);
		}

		const activity = presence.activities?.[0] ?? null;

		return c.json({
			success: true,
			data: {
				status: presence.status,
				activity: activity ? activity.state || activity.name : null,
				activityType: activity
					? (ActivityType[activity.type] ?? activity.type)
					: null,
				url: activity?.url ?? null,
			},
		});
	} catch (error) {
		getLogger(c).error(
			`GET /api/owner/presence error: ${error.message || error}`,
			{ label: 'api' },
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * PATCH /api/owner/presence
 * Update the bot's presence.
 * Body: { status: string, activityType: string, activity: string, url?: string }
 *
 * Valid status: online | idle | dnd | invisible
 * Valid activityType: Playing | Streaming | Listening | Watching | Competing | Custom
 */
app.patch('/presence', async (c) => {
	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	const { status, activity, url } = body;
	const activityType = body.activityType || body.type;

	const VALID_STATUSES = ['online', 'idle', 'dnd', 'invisible'];
	const VALID_TYPES = Object.keys(ActivityType).filter(
		(k) => typeof ActivityType[k] === 'number',
	);

	if (!status || !VALID_STATUSES.includes(status)) {
		return c.json(
			{
				success: false,
				error: `Invalid \`status\`. Must be one of: ${VALID_STATUSES.join(', ')}`,
			},
			400,
		);
	}

	if (!activityType || !VALID_TYPES.includes(activityType)) {
		return c.json(
			{
				success: false,
				error: `Invalid \`activityType\`. Must be one of: ${VALID_TYPES.join(', ')}`,
			},
			400,
		);
	}

	if (!activity || typeof activity !== 'string') {
		return c.json(
			{ success: false, error: 'Missing required field: activity' },
			400,
		);
	}

	if (
		activityType === 'Streaming' &&
		(!url ||
			(!url.startsWith('https://www.twitch.tv/') &&
				!url.startsWith('https://www.youtube.com/')))
	) {
		return c.json(
			{
				success: false,
				error:
					'A valid Twitch or YouTube URL is required when activityType is Streaming',
			},
			400,
		);
	}

	try {
		const client = getClient(c);

		const activityPayload = {
			name: activityType === 'Custom' ? 'Custom Status' : activity,
			type: ActivityType[activityType],
		};

		if (activityType === 'Custom') {
			activityPayload.state = activity;
		} else if (activityType === 'Streaming') {
			activityPayload.url = url;
		}

		client.user.setPresence({ activities: [activityPayload], status });

		getLogger(c).info(
			`Bot presence updated via API: status=${status}, activityType=${activityType}, activity="${activity}"`,
			{ label: 'api' },
		);

		return c.json({
			success: true,
			data: { status, activityType, activity, url: url ?? null },
		});
	} catch (error) {
		getLogger(c).error(
			`PATCH /api/owner/presence error: ${error.message || error}`,
			{ label: 'api' },
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// CHAT (DM as bot)
// =============================================================================

/**
 * POST /api/owner/chat
 * Send a message or container to a user or channel as the bot.
 * Body: { targetType: 'user' | 'channel', targetId: string, message: string, embed?: { title?: string, color?: string, imageUrl?: string } }
 */
app.post('/chat', async (c) => {
	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	const { targetType = 'user', targetId, message, embed } = body;
	// Backward compatibility fallback
	const finalTargetId = targetId || body.userId;

	if (!finalTargetId || typeof finalTargetId !== 'string') {
		return c.json(
			{ success: false, error: 'Missing or invalid required field: targetId' },
			400,
		);
	}
	if (!message || typeof message !== 'string' || !message.trim()) {
		return c.json(
			{ success: false, error: 'Missing or invalid required field: message' },
			400,
		);
	}

	try {
		const client = getClient(c);
		let target;

		if (targetType === 'channel') {
			target = await client.channels.fetch(finalTargetId).catch(() => null);
			if (!target?.isTextBased()) {
				return c.json(
					{ success: false, error: `Text channel ${finalTargetId} not found.` },
					404,
				);
			}
		} else {
			target = await client.users.fetch(finalTargetId).catch(() => null);
			if (!target) {
				return c.json(
					{ success: false, error: `User ${finalTargetId} not found.` },
					404,
				);
			}
		}

		const { helpers } = getContainer(c);
		const { simpleContainer, createContainer } = helpers.discord;

		let components;
		if (
			embed &&
			(embed.title || embed.color || embed.imageUrl || embed.footer)
		) {
			components = await createContainer(
				{ client },
				{
					title: embed.title || null,
					description: message.trim(),
					color: embed.color || null,
					media: embed.imageUrl ? [embed.imageUrl] : [],
					footer: embed.footer || false,
				},
			);
		} else {
			components = await simpleContainer({ client }, message.trim());
		}

		await target.send({
			components,
			flags: MessageFlags.IsComponentsV2,
		});

		const targetName =
			targetType === 'channel' ? `#${target.name}` : target.tag;

		getLogger(c).info(
			`Message sent to ${targetType} ${targetName} (${finalTargetId}) via API.`,
			{
				label: 'api',
			},
		);

		return c.json({
			success: true,
			message: `Message sent to ${targetType} ${targetName} (${finalTargetId}).`,
		});
	} catch (error) {
		getLogger(c).error(
			`POST /api/owner/chat error: ${error.message || error}`,
			{ label: 'api' },
		);
		// DMs can fail if the user has DMs disabled
		if (error.code === 50007 && targetType === 'user') {
			return c.json(
				{
					success: false,
					error: 'Cannot send messages to this user (DMs may be disabled).',
				},
				422,
			);
		}
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// RESTART
// =============================================================================

/** Module-level timer handle shared between POST (schedule) and DELETE (cancel). */
let apiRestartTimer = null;

/**
 * GET /api/owner/restart
 * Returns the currently scheduled restart timestamp (if any).
 */
app.get('/restart', (c) => {
	try {
		const client = getClient(c);
		const timestamp = client.kythiaRestartTimestamp ?? null;

		return c.json({
			success: true,
			scheduled: timestamp !== null,
			timestamp,
		});
	} catch (error) {
		getLogger(c).error(
			`GET /api/owner/restart error: ${error.message || error}`,
			{ label: 'api' },
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * DELETE /api/owner/restart
 * Cancel a previously scheduled restart.
 */
app.delete('/restart', (c) => {
	try {
		const client = getClient(c);

		if (!apiRestartTimer && !client.kythiaRestartTimestamp) {
			return c.json(
				{ success: false, error: 'No scheduled restart to cancel.' },
				404,
			);
		}

		if (apiRestartTimer) {
			clearTimeout(apiRestartTimer);
			apiRestartTimer = null;
		}

		client.kythiaRestartTimestamp = null;

		getLogger(c).info('Scheduled restart cancelled via API.', { label: 'api' });

		return c.json({
			success: true,
			message: 'Scheduled restart cancelled.',
		});
	} catch (error) {
		getLogger(c).error(
			`DELETE /api/owner/restart error: ${error.message || error}`,
			{ label: 'api' },
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// SETUP WIZARD (Dashboard config generator)
// ---------------------------------------------------------------------------

/**
 * GET /api/owner/setup
 * Returns the current active configuration mapped into the exact JSON
 * structure required by the setup wizard/writer.
 */
app.get('/setup', (c) => {
	const config = global.kythia || {};

	return c.json({
		success: true,
		data: {
			license: {
				licenseKey: config.licenseKey || process.env.LICENSE_KEY || '',
				acceptTOS: config.legal?.acceptTOS ?? true,
				dataCollection: config.legal?.dataCollection ?? true,
			},
			bot: config.bot || {},
			db: config.db || {},
			redis: config.redis || {},
			addons: config.addons || {},
			settings: config.settings || {},
			emojis: config.emojis || {},
			api: config.api || {},
		},
	});
});

/**
 * POST /api/owner/setup
 * Accepts the setup wizard JSON payload, writes the new .env and kythia.config.js
 * using the setup/writer utility, and schedules a restart.
 */
app.post('/setup', async (c) => {
	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	// Validate minimal required fields to avoid writer crashes
	if (!body.license || !body.bot || !body.db || !body.redis || !body.addons) {
		return c.json(
			{ success: false, error: 'Missing required setup blocks' },
			400,
		);
	}

	try {
		const path = require('node:path');
		// Require writer from the setup folder relative to the project root
		const writer = require(path.join(process.cwd(), 'setup', 'writer.js'));

		const { envPath, configPath, envBackup, configBackup } =
			writer.writeFiles(body);

		getLogger(c).info('Setup API generated new configuration files.', {
			label: 'api',
		});

		// Schedule a restart in 2 seconds so the response can be sent
		const client = getClient(c);
		setTimeout(async () => {
			if (client.shard) {
				await client.shard.respawnAll();
			} else {
				process.exit(0);
			}
		}, 2000);

		return c.json({
			success: true,
			message:
				'Configuration successfully updated. Bot will restart in 2 seconds.',
			files: {
				envPath,
				configPath,
				envBackup,
				configBackup,
			},
		});
	} catch (error) {
		getLogger(c).error(`POST /api/owner/setup error: ${error.message}`, {
			label: 'api',
		});
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// LIVE CONFIG PATCHER
// ---------------------------------------------------------------------------

/**
 * GET /api/owner/config
 * Returns the current active configuration mapped into the exact JSON
 * structure required by the config patcher. This is an alias for /setup's GET
 * logic, returning the current state for the dashboard forms.
 */
app.get('/config', (c) => {
	const config = global.kythia || {};

	return c.json({
		success: true,
		data: {
			licenseKey: config.licenseKey || process.env.LICENSE_KEY || '',
			legal: config.legal || {},
			owner: config.owner || {},
			bot: config.bot || {},
			db: config.db || {},
			addons: config.addons || {},
			settings: config.settings || {},
			emojis: config.emojis || {},
			api: config.api || {},
		},
	});
});

/**
 * PATCH /api/owner/config
 * Accepts a partial JSON payload (e.g., { bot: { botName: "New" } }) and safely
 * patches ONLY those specific fields into the live .env and kythia.config.js files,
 * leaving all other custom settings and comments untouched.
 */
app.patch('/config', async (c) => {
	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	if (!body || typeof body !== 'object') {
		return c.json({ success: false, error: 'Empty or invalid payload' }, 400);
	}

	try {
		const path = require('node:path');
		const patcher = require(
			path.join(__dirname, '..', 'helpers', 'configPatcher.js'),
		);

		const { envPath, configPath, envBackup, configBackup } =
			patcher.writePatchedFiles(body);

		getLogger(c).info(
			'Live Config Patcher successfully updated files. Triggering hot reload...',
			{
				label: 'api',
			},
		);

		// Trigger hot reload instead of restarting
		const { reloadConfig } = require('@coreHelpers/reload-config');
		reloadConfig();

		return c.json({
			success: true,
			message:
				'Configuration successfully patched and hot-reloaded with zero downtime.',
			files: {
				envPath,
				configPath,
				envBackup,
				configBackup,
			},
		});
	} catch (error) {
		getLogger(c).error(`PATCH /api/owner/config error: ${error.message}`, {
			label: 'api',
		});
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * POST /api/owner/restart
 * Restart the bot process.
 * Body: { target?: 'current'|'all'|'master', shardId?: number, delaySeconds?: number }
 */
app.post('/restart', async (c) => {
	let body;
	try {
		body = await c.req.json();
	} catch {
		body = {};
	}

	const { target = 'current', shardId = null, delaySeconds = 0 } = body;

	const VALID_TARGETS = ['current', 'all', 'master'];
	if (!VALID_TARGETS.includes(target)) {
		return c.json(
			{
				success: false,
				error: `Invalid \`target\`. Must be one of: ${VALID_TARGETS.join(', ')}`,
			},
			400,
		);
	}

	if (delaySeconds !== 0) {
		if (typeof delaySeconds !== 'number' || delaySeconds < 0) {
			return c.json(
				{
					success: false,
					error: '`delaySeconds` must be a non-negative number',
				},
				400,
			);
		}
	}

	getLogger(c).info(
		`Restart triggered via API. target=${target}, shardId=${shardId ?? 'n/a'}, delaySeconds=${delaySeconds}`,
		{ label: 'api' },
	);

	// Acknowledge immediately — by the time we restart, the connection may close
	c.header('Content-Type', 'application/json');
	await c.res;

	const doRestart = async () => {
		const client = getClient(c);

		if (shardId !== null) {
			if (client.shard) {
				await client.shard.broadcastEval(
					(cl, ctx) => {
						if (cl.shard.ids.includes(ctx.shardId)) process.exit(0);
					},
					{ context: { shardId } },
				);
			} else {
				process.exit(0);
			}
			return;
		}

		if (target === 'all') {
			if (client.shard) {
				await client.shard.respawnAll();
			} else {
				process.exit(0);
			}
			return;
		}

		if (target === 'master') {
			if (client.shard) {
				process.kill(process.ppid);
			} else {
				process.exit(0);
			}
			return;
		}

		// current shard / single process
		process.exit(0);
	};

	if (apiRestartTimer) clearTimeout(apiRestartTimer);

	if (delaySeconds > 0) {
		const client = getClient(c);
		client.kythiaRestartTimestamp = Date.now() + delaySeconds * 1000;
		apiRestartTimer = setTimeout(() => {
			apiRestartTimer = null;
			doRestart();
		}, delaySeconds * 1000);
	} else {
		setTimeout(() => doRestart(), 0);
	}

	return c.json({
		success: true,
		message:
			delaySeconds > 0
				? `Restart scheduled in ${delaySeconds} seconds. target=${target}${shardId !== null ? `, shardId=${shardId}` : ''}`
				: `Restarting now. target=${target}${shardId !== null ? `, shardId=${shardId}` : ''}`,
		target,
		shardId: shardId ?? null,
		delaySeconds,
	});
});

// =============================================================================
// GLOBAL PROFILE
// =============================================================================

/**
 * GET /api/owner/profile
 * Get the main bot's current global profile (username, avatar, banner, bio/description).
 */
app.get('/profile', async (c) => {
	try {
		const client = getClient(c);

		// Ensure application data is fetched so we can get the description (bio)
		if (!client.application?.description) {
			await client.application?.fetch().catch(() => null);
		}

		return c.json({
			success: true,
			data: {
				nickname: client.user.username,
				avatar:
					client.user.displayAvatarURL({ extension: 'png', size: 1024 }) ??
					null,
				banner: client.user.bannerURL({ extension: 'png', size: 1024 }) ?? null,
				bio: client.application?.description ?? null,
			},
		});
	} catch (error) {
		getLogger(c).error(
			`GET /api/owner/profile error: ${error.message || error}`,
			{ label: 'api' },
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * PATCH /api/owner/profile
 * Update the main bot's global profile.
 * Body: { nickname?: string, avatar?: string, banner?: string, bio?: string }
 */
app.patch('/profile', async (c) => {
	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	const { nickname, avatar, banner, bio } = body;

	try {
		const client = getClient(c);
		let hasChanges = false;

		// Update application description (bio)
		if (
			bio !== undefined &&
			bio !== (client.application?.description ?? null)
		) {
			await client.application
				?.edit({ description: bio || '' })
				.catch((err) => {
					getLogger(c).error(`Failed to update bot bio: ${err.message}`, {
						label: 'api',
					});
					throw new Error(`Bio update failed: ${err.message}`);
				});
			hasChanges = true;
		}

		// Update user profile (username, avatar, banner)
		const userEdits = {};
		if (nickname !== undefined && nickname !== client.user.username) {
			userEdits.username = nickname;
		}
		if (avatar !== undefined) {
			userEdits.avatar = avatar;
		}
		if (banner !== undefined) {
			userEdits.banner = banner;
		}

		if (Object.keys(userEdits).length > 0) {
			await client.user.edit(userEdits).catch((err) => {
				getLogger(c).error(`Failed to update bot profile: ${err.message}`, {
					label: 'api',
				});
				throw new Error(
					`Profile update failed: ${err.message}. Note: Discord rate limits profile changes.`,
				);
			});
			hasChanges = true;
		}

		if (hasChanges) {
			getLogger(c).info('Global bot profile updated via API.', {
				label: 'api',
			});
		}

		// Fetch updated application if needed
		if (hasChanges) {
			await client.application?.fetch().catch(() => null);
		}

		return c.json({
			success: true,
			message: 'Global profile updated successfully',
			data: {
				nickname: client.user.username,
				avatar:
					client.user.displayAvatarURL({ extension: 'png', size: 1024 }) ??
					null,
				banner: client.user.bannerURL({ extension: 'png', size: 1024 }) ?? null,
				bio: client.application?.description ?? null,
			},
		});
	} catch (error) {
		getLogger(c).error(
			`PATCH /api/owner/profile error: ${error.message || error}`,
			{ label: 'api' },
		);
		// Return 400 for Discord API errors like rate limits or bad image formats
		return c.json({ success: false, error: error.message }, 400);
	}
});

module.exports = app;
