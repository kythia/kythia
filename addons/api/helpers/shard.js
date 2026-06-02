/**
 * @namespace: addons/api/helpers/shard.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

/**
 * Collect the guild list from every shard and flatten into one array.
 *
 * @param {import('discord.js').Client} client
 * @returns {Promise<Array<{id:string,name:string,icon:string|null,memberCount:number,ownerId:string}>>}
 */
async function broadcastGetGuilds(client) {
	if (!client.shard) {
		// Non-sharded fallback
		return client.guilds.cache.map((g) => ({
			id: g.id,
			name: g.name,
			icon: g.iconURL(),
			memberCount: g.memberCount,
			ownerId: g.ownerId,
			shardId: 0,
		}));
	}

	/** @type {Array<Array<object>>} */
	const results = await client.shard.broadcastEval((c) => {
		const shardId = c.shard?.ids?.[0] ?? 0;
		return c.guilds.cache.map((g) => ({
			id: g.id,
			name: g.name,
			icon: g.iconURL(),
			memberCount: g.memberCount,
			ownerId: g.ownerId,
			shardId,
		}));
	});

	// results is [ [guilds from shard 0], [guilds from shard 1], … ]
	return results.flat();
}

/**
 * Find a single guild across all shards.
 * Returns null if the bot is not in that guild on any shard.
 *
 * @param {import('discord.js').Client} client
 * @param {string} guildId
 * @returns {Promise<{
 *   shardId: number,
 *   guild: { id:string, name:string, icon:string|null },
 *   channels: { text: object[], voice: object[], categories: object[] },
 *   roles: object[],
 *   botUser: { username:string, avatar:string, id:string, discriminator:string }
 * } | null>}
 */
async function broadcastFindGuild(client, guildId) {
	if (!client.shard) {
		// Non-sharded fallback
		const guild = client.guilds.cache.get(guildId);
		if (!guild) return null;
		return _extractGuildData(guild, client, 0);
	}

	/** @type {Array<object|null>} */
	const results = await client.shard.broadcastEval(
		(c, { id }) => {
			const g = c.guilds.cache.get(id);
			if (!g) return null;

			const shardIds = c.shard?.ids ?? [0];

			return {
				shardId: shardIds[0],
				guild: {
					id: g.id,
					name: g.name,
					icon: g.iconURL(),
					memberCount: g.memberCount,
					ownerId: g.ownerId,
					premiumTier: g.premiumTier,
					premiumSubscriptionCount: g.premiumSubscriptionCount,
					createdTimestamp: g.createdTimestamp,
					joinedTimestamp: g.joinedTimestamp,
					verificationLevel: g.verificationLevel,
					preferredLocale: g.preferredLocale,
					premiumProgressBarEnabled: g.premiumProgressBarEnabled,
				},
				channels: {
					text: g.channels.cache
						.filter(
							(ch) =>
								ch.type === 0 &&
								ch.viewable &&
								ch.permissionsFor(g.members.me)?.has('SendMessages'),
						)
						.map((ch) => ({ id: ch.id, name: ch.name })),
					voice: g.channels.cache
						.filter((ch) => ch.type === 2 && ch.viewable)
						.map((ch) => ({ id: ch.id, name: ch.name })),
					categories: g.channels.cache
						.filter((ch) => ch.type === 4 && ch.viewable)
						.map((ch) => ({ id: ch.id, name: ch.name })),
				},
				roles: g.roles.cache.map((r) => ({
					id: r.id,
					name: r.name,
					color: r.hexColor,
					managed: r.managed,
					position: r.position,
				})),
				botUser: {
					username: c.user.username,
					avatar: c.user.displayAvatarURL(),
					banner: c.user.bannerURL() ?? null,
					bio: c.application.description ?? null,
					id: c.user.id,
					discriminator: c.user.discriminator,
					highestRolePosition: g.members.me?.roles.highest?.position ?? 0,
					permissions: g.members.me?.permissions.toArray() ?? [],
				},
			};
		},
		{ context: { id: guildId } },
	);

	// Find the first shard that had the guild
	return results.find((r) => r !== null) ?? null;
}

/**
 * Collect aggregate stats (guild count, user count) from all shards.
 *
 * @param {import('discord.js').Client} client
 * @returns {Promise<{guilds: number, users: number}>}
 */
async function broadcastGetStats(client) {
	if (!client.shard) {
		return {
			guilds: client.guilds.cache.size,
			users: client.users.cache.size,
			totalMemory: process.memoryUsage().rss,
		};
	}

	const [guildCounts, userCounts, memoryUsages] = await Promise.all([
		client.shard.fetchClientValues('guilds.cache.size'),
		client.shard.fetchClientValues('users.cache.size'),
		client.shard.broadcastEval(() => process.memoryUsage().rss),
	]);

	return {
		guilds: guildCounts.reduce((acc, n) => acc + n, 0),
		users: userCounts.reduce((acc, n) => acc + n, 0),
		totalMemory: memoryUsages.reduce((acc, n) => acc + n, 0),
	};
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Extract the same shape as broadcastFindGuild from a local Guild object.
 * Used by the non-sharded fallback path.
 */
function _extractGuildData(guild, client, shardId) {
	return {
		shardId,
		guild: {
			id: guild.id,
			name: guild.name,
			icon: guild.iconURL(),
			memberCount: guild.memberCount,
			ownerId: guild.ownerId,
			premiumTier: guild.premiumTier,
			premiumSubscriptionCount: guild.premiumSubscriptionCount,
			createdTimestamp: guild.createdTimestamp,
			joinedTimestamp: guild.joinedTimestamp,
			verificationLevel: guild.verificationLevel,
			preferredLocale: guild.preferredLocale,
			premiumProgressBarEnabled: guild.premiumProgressBarEnabled,
		},
		channels: {
			text: guild.channels.cache
				.filter(
					(ch) =>
						ch.type === 0 &&
						ch.viewable &&
						ch.permissionsFor(guild.members.me)?.has('SendMessages'),
				)
				.map((ch) => ({ id: ch.id, name: ch.name })),
			voice: guild.channels.cache
				.filter((ch) => ch.type === 2 && ch.viewable)
				.map((ch) => ({ id: ch.id, name: ch.name })),
			categories: guild.channels.cache
				.filter((ch) => ch.type === 4 && ch.viewable)
				.map((ch) => ({ id: ch.id, name: ch.name })),
		},
		roles: guild.roles.cache.map((r) => ({
			id: r.id,
			name: r.name,
			color: r.hexColor,
			managed: r.managed,
			position: r.position,
		})),
		botUser: {
			username: client.user.username,
			avatar: client.user.displayAvatarURL(),
			banner: client.user.bannerURL() ?? null,
			bio: client.application.description ?? null,
			id: client.user.id,
			discriminator: client.user.discriminator,
			highestRolePosition: guild.members.me?.roles.highest?.position ?? 0,
			permissions: guild.members.me?.permissions.toArray() ?? [],
		},
	};
}

/**
 * Collect aggregate meta stats (server count + total member count) from all shards.
 * Used by the /api/meta/stats endpoint.
 *
 * @param {import('discord.js').Client} client
 * @returns {Promise<{totalServers: number, totalMembers: number}>}
 */
async function broadcastGetMeta(client) {
	if (!client.shard) {
		return {
			totalServers: client.guilds.cache.size,
			totalMembers: client.guilds.cache.reduce(
				(acc, g) => acc + (g.memberCount || 0),
				0,
			),
			totalMemory: process.memoryUsage().rss,
		};
	}

	const results = await client.shard.broadcastEval((c) => ({
		servers: c.guilds.cache.size,
		members: c.guilds.cache.reduce((acc, g) => acc + (g.memberCount || 0), 0),
		totalMemory: process.memoryUsage().rss,
	}));

	return {
		totalServers: results.reduce((acc, r) => acc + r.servers, 0),
		totalMembers: results.reduce((acc, r) => acc + r.members, 0),
		totalMemory: results.reduce((acc, r) => acc + r.totalMemory, 0),
	};
}

/**
 * Collect detailed statistics for each shard.
 *
 * @param {import('discord.js').Client} client
 * @returns {Promise<Array<{id: number, ping: number, guilds: number, members: number, uptime: number, ram_usage: number}>>}
 */
async function broadcastGetDetailedShards(client) {
	if (!client.shard) {
		return [
			{
				id: 0,
				ping: Math.round(client.ws.ping),
				guilds: client.guilds.cache.size,
				members: client.guilds.cache.reduce(
					(acc, g) => acc + (g.memberCount || 0),
					0,
				),
				uptime: client.uptime,
				ram_usage: process.memoryUsage().rss,
			},
		];
	}

	const results = await client.shard.broadcastEval((c) => ({
		id: c.shard.ids[0],
		ping: Math.round(c.ws.ping),
		guilds: c.guilds.cache.size,
		members: c.guilds.cache.reduce((acc, g) => acc + (g.memberCount || 0), 0),
		uptime: c.uptime,
		ram_usage: process.memoryUsage().rss,
	}));

	return results.sort((a, b) => a.id - b.id);
}

/**
 * Edit the bot's GuildMember on the shard that owns the given guild.
 * Returns `true` if the edit was applied, `false` if the guild wasn't found on any shard.
 * Throws if Discord rejects the edit (propagate to the caller for error handling).
 *
 * @param {import('discord.js').Client} client
 * @param {string} guildId
 * @param {{ nick?: string|null, avatar?: string|null }} payload  Fields to pass to GuildMember#edit()
 * @returns {Promise<boolean>}
 */
async function broadcastEditMember(client, guildId, payload) {
	if (!client.shard) {
		const guild = client.guilds.cache.get(guildId);
		if (!guild) return false;
		await guild.members.editMe(payload);
		return true;
	}

	const results = await client.shard.broadcastEval(
		async (c, { id, editPayload }) => {
			const g = c.guilds.cache.get(id);
			if (!g) return null;
			await g.members.editMe(editPayload);
			return true;
		},
		{ context: { id: guildId, editPayload: payload } },
	);

	return results.some((r) => r === true);
}

/**
 * Fetch and collect all members of a specific guild across all shards.
 *
 * @param {import('discord.js').Client} client
 * @param {string} guildId
 * @param {boolean} detailed
 * @returns {Promise<Array<object>|null>}
 */
async function broadcastGetGuildMembers(client, guildId, detailed = false) {
	if (!client.shard) {
		const guild = client.guilds.cache.get(guildId);
		if (!guild) return null;

		await guild.members.fetch().catch(() => null);

		return guild.members.cache.map((m) => {
			if (detailed) {
				return {
					id: m.id,
					username: m.user.username,
					discriminator: m.user.discriminator,
					avatar: m.user.displayAvatarURL(),
					bot: m.user?.bot ?? false,
					roles: m.roles.cache.map((r) => r.id),
					joinedAt: m.joinedTimestamp,
				};
			}
			return {
				id: m.id,
				username: m.user.username,
			};
		});
	}

	const results = await client.shard.broadcastEval(
		async (c, { id, isDetailed }) => {
			const g = c.guilds.cache.get(id);
			if (!g) return null;

			await g.members.fetch().catch(() => null);

			return g.members.cache.map((m) => {
				if (isDetailed) {
					return {
						id: m.id,
						username: m.user.username,
						discriminator: m.user.discriminator,
						avatar: m.user.displayAvatarURL(),
						bot: m.user?.bot ?? false,
						roles: m.roles.cache.map((r) => r.id),
						joinedAt: m.joinedTimestamp,
					};
				}
				return {
					id: m.id,
					username: m.user.username,
				};
			});
		},
		{ context: { id: guildId, isDetailed: detailed } },
	);

	return results.find((r) => r !== null) ?? null;
}

/**
 * Fetch and collect basic user information (id, username, avatar) across all shards.
 * Uses the users cache. Fast and lightweight.
 *
 * @param {import('discord.js').Client} client
 * @param {string[]} userIds
 * @returns {Promise<Array<{id: string, username: string, avatar: string|null}>>}
 */
async function broadcastGetUsers(client, userIds) {
	if (!userIds || userIds.length === 0) return [];

	if (!client.shard) {
		const found = [];
		for (const id of userIds) {
			const u = client.users.cache.get(id);
			if (u) {
				found.push({
					id: u.id,
					username: u.username,
					avatar: u.displayAvatarURL({ size: 64 }),
				});
			}
		}
		return found;
	}

	const results = await client.shard.broadcastEval(
		(c, { ids }) => {
			const localFound = [];
			for (const id of ids) {
				const u = c.users.cache.get(id);
				if (u) {
					localFound.push({
						id: u.id,
						username: u.username,
						avatar: u.displayAvatarURL({ size: 64 }),
					});
				}
			}
			return localFound;
		},
		{ context: { ids: userIds } },
	);

	const finalMap = new Map();
	for (const shardUsers of results) {
		for (const u of shardUsers) {
			if (!finalMap.has(u.id)) {
				finalMap.set(u.id, u);
			}
		}
	}
	return Array.from(finalMap.values());
}

module.exports = {
	broadcastGetGuilds,
	broadcastFindGuild,
	broadcastGetStats,
	broadcastGetMeta,
	broadcastGetDetailedShards,
	broadcastEditMember,
	broadcastGetGuildMembers,
	broadcastGetUsers,
};
