/**
 * @namespace: addons/api/routes/users.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Hono } = require('hono');
const app = new Hono();

app.post('/:userId/managed-guilds', async (c) => {
	const userId = c.req.param('userId');
	const { guilds } = await c.req.json(); // Expects { guilds: [{ id, permissions }] }
	const client = c.get('client');
	const container = c.get('container');
	const { ServerSetting } = container.models;

	if (!guilds || !Array.isArray(guilds)) {
		return c.json({ error: 'Invalid guilds array' }, 400);
	}

	const managedGuildIds = [];
	const botGuilds = [];
	// const pendingBotMasterChecks = [];

	// First pass: grant MANAGE_GUILD and collect guilds the bot is in
	for (const g of guilds) {
		const guildId = g.id;
		const perms = BigInt(g.permissions || 0);

		// Check if user has MANAGE_GUILD (0x20) or ADMINISTRATOR (0x8) from OAuth
		if ((perms & 0x20n) === 0x20n || (perms & 0x8n) === 0x8n) {
			managedGuildIds.push(guildId);
		} else if (client.guilds.cache.has(guildId)) {
			// Bot is in the guild, user doesn't have native admin, needs Bot Master check
			botGuilds.push(guildId);
		}
	}

	// Second pass: bulk fetch settings for remaining guilds
	if (botGuilds.length > 0) {
		try {
			const settings = await ServerSetting.getAllCache({
				where: { guildId: botGuilds },
			});
			const settingsMap = new Map(
				settings.map((s) => [s.guildId, s.admins || []]),
			);

			// We need to fetch members concurrently, but batch them to avoid rate limits
			const fetchPromises = botGuilds.map(async (guildId) => {
				const botMasters = settingsMap.get(guildId) || [];
				if (botMasters.length > 0) {
					const { getGuildSafe, getMemberSafe } = container.helpers.discord;
					const guild = await getGuildSafe(client, guildId);
					if (guild) {
						const member = await getMemberSafe(guild, userId);
						if (member) {
							const hasBotMaster = botMasters.some((roleId) =>
								member.roles.cache.has(roleId),
							);
							if (hasBotMaster) {
								managedGuildIds.push(guildId);
							}
						}
					}
				}
			});

			await Promise.all(fetchPromises);
		} catch (err) {
			container.logger.error(
				`Error checking bot masters: ${err.message || err}`,
				{ label: 'api' },
			);
		}
	}

	return c.json({ managedGuildIds });
});

// =============================================================================
// GET /api/users/:userId/premium
// Returns the premium and vote status for a given Discord user ID from KythiaUser.
// Dashboard uses this to show lock banners on addon setting pages.
// Cached on the bot side via the model cache layer.
// =============================================================================
app.get('/:userId/premium', async (c) => {
	const userId = c.req.param('userId');
	const client = c.get('client');
	const container = c.get('container') ?? client?.container;

	if (!container) {
		return c.json({ success: false, error: 'Container not available' }, 500);
	}

	const { models, helpers } = container;
	const { KythiaUser } = models;

	if (!KythiaUser) {
		return c.json(
			{ success: false, error: 'KythiaUser model not loaded' },
			503,
		);
	}

	try {
		// Bot owner always gets full premium
		const isOwner = helpers?.discord?.isOwner(userId) ?? false;
		if (isOwner) {
			return c.json({
				success: true,
				userId,
				isPremium: true,
				premiumTier: 'yours',
				premiumExpiresAt: null,
				isVoted: true,
				voteExpiresAt: null,
				isOwner: true,
			});
		}

		const user = await KythiaUser.getCache({ userId });

		if (!user) {
			return c.json({
				success: true,
				userId,
				isPremium: false,
				premiumTier: 'none',
				premiumExpiresAt: null,
				isVoted: false,
				voteExpiresAt: null,
				isOwner: false,
			});
		}

		// Determine active premium status
		let activeTier = user.premiumTier ?? 'none';
		let isPremiumActive = user.isPremium === true;

		if (
			user.premiumExpiresAt &&
			new Date(user.premiumExpiresAt).getTime() <= Date.now()
		) {
			// Expired
			activeTier = 'none';
			isPremiumActive = false;
		}

		// Determine active vote status
		let isVotedActive = user.isVoted === true;
		if (
			user.voteExpiresAt &&
			new Date(user.voteExpiresAt).getTime() <= Date.now()
		) {
			isVotedActive = false;
		}

		return c.json({
			success: true,
			userId,
			isPremium: isPremiumActive,
			premiumTier: activeTier ?? 'none',
			premiumExpiresAt: user.premiumExpiresAt ?? null,
			isVoted: isVotedActive,
			voteExpiresAt: user.voteExpiresAt ?? null,
			isOwner: false,
		});
	} catch (err) {
		return c.json({ success: false, error: err.message }, 500);
	}
});

// =============================================================================
// GET /api/users/:userId/premium-servers
// Lists all bound premium servers for a user and their quota.
// =============================================================================
app.get('/:userId/premium-servers', async (c) => {
	const userId = c.req.param('userId');
	const container = c.get('container') ?? c.get('client')?.container;
	const { models, helpers } = container;
	const { KythiaUser, PremiumServerBind } = models;

	try {
		let maxSlots = 0;
		const isOwner = helpers?.discord?.isOwner(userId) ?? false;
		let activeTier = 'none';

		if (isOwner) {
			maxSlots = 100; // Owners basically have unlimited slots
			activeTier = 'yours';
		} else {
			const user = await KythiaUser.getCache({ userId });
			if (
				user?.premiumTier &&
				user?.premiumExpiresAt &&
				new Date(user.premiumExpiresAt) > new Date()
			) {
				activeTier = user.premiumTier;
				if (activeTier === 'yours') maxSlots = 1;
				if (activeTier === 'ecosystem') maxSlots = 3;
			}
		}

		if (!PremiumServerBind) {
			return c.json({ success: true, maxSlots, boundServers: [] });
		}

		const binds = await PremiumServerBind.getAllCache({ where: { userId } });

		return c.json({
			success: true,
			activeTier,
			maxSlots,
			usedSlots: binds.length,
			boundServers: binds.map((b) => b.guildId),
		});
	} catch (err) {
		return c.json({ success: false, error: err.message }, 500);
	}
});

// =============================================================================
// POST /api/users/:userId/premium-servers
// Binds a new server to the user's premium slots.
// =============================================================================
app.post('/:userId/premium-servers', async (c) => {
	const userId = c.req.param('userId');
	const { guildId } = await c.req.json();
	const container = c.get('container') ?? c.get('client')?.container;
	const { models, helpers, logger } = container;
	const { KythiaUser, PremiumServerBind } = models;

	if (!guildId) {
		return c.json({ success: false, error: 'guildId is required' }, 400);
	}

	try {
		let maxSlots = 0;
		const isOwner = helpers?.discord?.isOwner(userId) ?? false;

		if (isOwner) {
			maxSlots = 100;
		} else {
			const user = await KythiaUser.getCache({ userId });
			if (
				user?.premiumTier &&
				user?.premiumExpiresAt &&
				new Date(user.premiumExpiresAt) > new Date()
			) {
				if (user.premiumTier === 'yours') maxSlots = 1;
				if (user.premiumTier === 'ecosystem') maxSlots = 3;
			}
		}

		if (maxSlots === 0) {
			return c.json(
				{
					success: false,
					error:
						'User does not have an eligible premium tier for server binding',
				},
				403,
			);
		}

		const existingBinds = await PremiumServerBind.getAllCache({
			where: { userId },
		});
		if (existingBinds.length >= maxSlots) {
			return c.json(
				{ success: false, error: `Maximum slot limit reached (${maxSlots})` },
				403,
			);
		}

		// Check if guild is already bound by someone else
		const existingGuildBind = await PremiumServerBind.getCache({ guildId });
		if (existingGuildBind) {
			if (existingGuildBind.userId === userId) {
				return c.json(
					{ success: false, error: 'Server is already bound by you' },
					400,
				);
			}
			return c.json(
				{ success: false, error: 'Server is already bound by another user' },
				400,
			);
		}

		await PremiumServerBind.create({ guildId, userId });

		logger.info(`User ${userId} bound premium to guild ${guildId}`, {
			label: 'api',
		});

		return c.json({ success: true, guildId });
	} catch (err) {
		return c.json({ success: false, error: err.message }, 500);
	}
});

// =============================================================================
// DELETE /api/users/:userId/premium-servers/:guildId
// Unbinds a server from the user's premium slots.
// =============================================================================
app.delete('/:userId/premium-servers/:guildId', async (c) => {
	const userId = c.req.param('userId');
	const guildId = c.req.param('guildId');
	const container = c.get('container') ?? c.get('client')?.container;
	const { models, logger } = container;
	const { PremiumServerBind } = models;

	try {
		const bind = await PremiumServerBind.getCache({ guildId, userId });
		if (!bind) {
			return c.json(
				{ success: false, error: 'Server is not bound by this user' },
				404,
			);
		}

		await bind.destroy();

		logger.info(`User ${userId} unbound premium from guild ${guildId}`, {
			label: 'api',
		});

		return c.json({ success: true });
	} catch (err) {
		return c.json({ success: false, error: err.message }, 500);
	}
});

module.exports = app;
