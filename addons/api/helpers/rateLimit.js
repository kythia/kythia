/**
 * @namespace: addons/api/helpers/rateLimit.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

// Simple in-memory rate limiter
const rateLimitMap = new Map();

/**
 * Creates a rate limiting middleware for Hono
 * @param {Object} options Options for rate limiting
 * @param {number} options.windowMs Time window in milliseconds (default 1 minute)
 * @param {number} options.limit Maximum requests per window (default 60)
 * @returns {Function} Hono middleware
 */
const rateLimit = (options = {}) => {
	const windowMs = options.windowMs || 60 * 1000;
	const limit = options.limit || 60;

	return async (c, next) => {
		// Use request IP as key. Fallback to 'unknown' if not available.
		// Note: Hono's c.req.header('x-forwarded-for') or similar might be needed behind proxies.
		const ip =
			c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
		const now = Date.now();

		let requestInfo = rateLimitMap.get(ip);

		if (!requestInfo || now - requestInfo.windowStart > windowMs) {
			requestInfo = {
				count: 1,
				windowStart: now,
			};
		} else {
			requestInfo.count++;
		}

		rateLimitMap.set(ip, requestInfo);

		if (requestInfo.count > limit) {
			return c.json(
				{
					success: false,
					error: 'Too many requests, please try again later.',
				},
				429,
			);
		}

		await next();
	};
};

setInterval(
	() => {
		const now = Date.now();
		for (const [ip, info] of rateLimitMap.entries()) {
			if (now - info.windowStart > 60 * 60 * 1000) {
				rateLimitMap.delete(ip);
			}
		}
	},
	60 * 60 * 1000,
);

module.exports = { rateLimit };
