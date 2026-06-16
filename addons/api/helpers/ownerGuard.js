/**
 * @namespace: addons/api/helpers/ownerGuard.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

/**
 * Middleware that restricts a route to the bot owner(s) only.
 *
 * Authentication happens in two stages:
 *  1. The request must already pass the global Bearer token check on /api/*.
 *  2. This middleware additionally requires the `X-Owner-Id` header to be set
 *     to a Discord user ID that the bot recognises as an owner via
 *     `container.helpers.discord.isOwner(userId)`.
 *
 * This mirrors the bot-side `ownerOnly: true` guard used on slash commands.
 *
 * @returns {import('hono').MiddlewareHandler}
 */
function ownerGuard() {
	return async (c, next) => {
		const container = c.get('client')?.container;

		if (!container) {
			return c.json(
				{ success: false, error: 'Internal: container unavailable' },
				500,
			);
		}

		const { helpers, logger } = container;
		const isOwner = helpers?.discord?.isOwner;

		if (typeof isOwner !== 'function') {
			logger?.warn('ownerGuard: isOwner helper not found — denying access', {
				label: 'api',
			});
			return c.json(
				{ success: false, error: 'Owner guard is not configured.' },
				503,
			);
		}

		const requestedOwnerId = c.req.header('X-Owner-Id');

		if (!requestedOwnerId) {
			return c.json(
				{
					success: false,
					error:
						'Missing required header: X-Owner-Id. Provide your Discord user ID to authorise as an owner.',
				},
				403,
			);
		}

		if (!isOwner(requestedOwnerId)) {
			logger?.warn(`ownerGuard: access denied for userId=${requestedOwnerId}`, {
				label: 'api',
			});
			return c.json(
				{
					success: false,
					error: `User ${requestedOwnerId} is not recognised as a bot owner.`,
				},
				403,
			);
		}

		// Expose the verified owner ID on the context for downstream use
		c.set('ownerId', requestedOwnerId);

		await next();
	};
}

module.exports = ownerGuard;
