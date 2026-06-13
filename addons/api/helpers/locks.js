/**
 * @namespace: addons/api/helpers/locks.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const TIER_LEVELS = {
	none: 0,
	cute: 1,
	powerful: 2,
	yours: 3,
	ecosystem: 4,
};

/**
 * Creates a Hono middleware that requires a specific premium tier.
 * @param {string} tier The required premium tier ('cute', 'powerful', etc.)
 * @returns {import('hono').MiddlewareHandler}
 */
function requirePremium(tier = 'cute') {
	return async (c, next) => {
		const userId = c.req.header('X-User-Id');
		if (!userId) {
			return c.json(
				{
					status: 'error',
					error:
						'Missing X-User-Id header. The dashboard must pass the acting user ID.',
					code: 'MISSING_USER_ID',
				},
				400,
			);
		}

		const container = c.get('container');
		const { helpers, redis, models } = container;

		if (helpers.discord.isOwner(userId)) return await next();

		// Team bypass
		const teamCacheKey = `kythia:middleware:teamOnly:${userId}`;
		let isTeamMember = await redis.get(teamCacheKey);
		if (isTeamMember !== null) {
			isTeamMember = JSON.parse(isTeamMember);
		} else {
			isTeamMember = await helpers.discord.isTeam(container, userId);
			await redis.set(
				teamCacheKey,
				JSON.stringify(Boolean(isTeamMember)),
				'EX',
				1800,
			);
		}
		if (isTeamMember) return await next();

		// Check tier
		const requiredTierLevel = TIER_LEVELS[tier] || 0;
		if (requiredTierLevel === 0) return await next();

		const premiumCacheKey = `kythia:middleware:premiumTier:${userId}`;
		let userPremiumTier = await redis.get(premiumCacheKey);

		if (!userPremiumTier) {
			const { KythiaUser } = models;
			const user = await KythiaUser.getCache({ userId });

			let activeTier = 'none';
			if (user?.premiumTier) {
				if (
					user.premiumExpiresAt &&
					new Date(user.premiumExpiresAt).getTime() > Date.now()
				) {
					activeTier = user.premiumTier;
				} else if (!user.premiumExpiresAt) {
					activeTier = user.premiumTier;
				} else {
					user.premiumTier = 'none';
					user.premiumExpiresAt = null;
					user.changed('premiumTier', true);
					user.changed('premiumExpiresAt', true);
					await user.save();
				}
			}
			userPremiumTier = activeTier;
			await redis.set(premiumCacheKey, userPremiumTier, 'EX', 300);
		}

		const userTierLevel = TIER_LEVELS[userPremiumTier] || 0;
		if (userTierLevel < requiredTierLevel) {
			return c.json(
				{
					status: 'error',
					error: `Premium Required: ${tier}`,
					code: 'PREMIUM_LOCKED',
					requiredTier: tier,
				},
				403,
			);
		}

		await next();
	};
}

/**
 * Creates a Hono middleware that requires the user to have voted.
 * @returns {import('hono').MiddlewareHandler}
 */
function requireVote() {
	return async (c, next) => {
		const userId = c.req.header('X-User-Id');
		if (!userId) {
			return c.json(
				{
					status: 'error',
					error:
						'Missing X-User-Id header. The dashboard must pass the acting user ID.',
					code: 'MISSING_USER_ID',
				},
				400,
			);
		}

		const container = c.get('container');
		const { helpers, redis } = container;

		if (helpers.discord.isOwner(userId)) return await next();

		// Team bypass
		const teamCacheKey = `kythia:middleware:teamOnly:${userId}`;
		let isTeamMember = await redis.get(teamCacheKey);
		if (isTeamMember !== null) {
			isTeamMember = JSON.parse(isTeamMember);
		} else {
			isTeamMember = await helpers.discord.isTeam(container, userId);
			await redis.set(
				teamCacheKey,
				JSON.stringify(Boolean(isTeamMember)),
				'EX',
				1800,
			);
		}
		if (isTeamMember) return await next();

		// Check Premium bypass
		const premiumCacheKey = `kythia:middleware:premiumTier:${userId}`;
		let userPremiumTier = await redis.get(premiumCacheKey);

		if (!userPremiumTier) {
			const { KythiaUser } = container.models;
			const user = await KythiaUser.getCache({ userId });

			let activeTier = 'none';
			if (user?.premiumTier) {
				if (
					user.premiumExpiresAt &&
					new Date(user.premiumExpiresAt).getTime() > Date.now()
				) {
					activeTier = user.premiumTier;
				} else if (!user.premiumExpiresAt) {
					activeTier = user.premiumTier;
				} else {
					user.premiumTier = 'none';
					user.premiumExpiresAt = null;
					user.changed('premiumTier', true);
					user.changed('premiumExpiresAt', true);
					await user.save();
				}
			}
			userPremiumTier = activeTier;
			await redis.set(premiumCacheKey, userPremiumTier, 'EX', 300);
		}

		if (userPremiumTier && userPremiumTier !== 'none') {
			return await next();
		}

		// Check Server Premium bypass
		const guildId = c.req.param('guildId') || c.req.param('id');
		if (guildId) {
			try {
				const { getGuildPremiumTier } = container.helpers.premiumServer;
				const guildTier = await getGuildPremiumTier(guildId, container.models);
				if (guildTier) return await next(); // Server is premium!
			} catch (err) {
				container.logger.error(
					`Error checking guild premium tier in API: ${err.message}`,
					{ label: 'api' },
				);
			}
		}

		// Check Top.gg vote cache
		const voteCacheKey = `kythia:topgg:vote:${userId}`;
		const isVoted = await redis.get(voteCacheKey);

		if (!isVoted) {
			return c.json(
				{
					status: 'error',
					error: 'Top.gg Vote Required',
					code: 'VOTE_LOCKED',
				},
				403,
			);
		}

		await next();
	};
}

module.exports = {
	requirePremium,
	requireVote,
};
