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
					const guild = client.guilds.cache.get(guildId);
					if (guild) {
						const member = await guild.members.fetch(userId).catch(() => null); // user might not be in the guild anymore (rare, but possible)
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

module.exports = app;
