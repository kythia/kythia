/**
 * @namespace: addons/api/routes/vote.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Hono } = require('hono');
const { Op } = require('sequelize');
const app = new Hono();

// =============================================================================
// GET /api/vote/leaderboard
// Returns the top voters.
// =============================================================================
app.get('/leaderboard', async (c) => {
	const container = c.get('container');
	const client = c.get('client');
	const { models } = container;
	const { KythiaUser } = models;
	try {
		const leaderboard = await KythiaUser.getAllCache({
			where: {
				votePoints: {
					[Op.gt]: 0,
				},
			},
			order: [['votePoints', 'DESC']],
			limit: 100,
			// Fetch up to 100 top voters
			ttl: 5 * 60 * 1000,
		});

		// Resolve Discord user information
		const detailedLeaderboard = await Promise.all(
			leaderboard.map(async (lbUser) => {
				let discordUser;
				try {
					discordUser = await client.container.helpers.discord.getUserSafe(
						client,
						lbUser.userId,
					);
				} catch (_e) {
					discordUser = null;
				}
				return {
					userId: lbUser.userId,
					votePoints: lbUser.votePoints,
					username: discordUser ? discordUser.username : 'Unknown User',
					avatarUrl: discordUser
						? discordUser.displayAvatarURL({
								extension: 'png',
								forceStatic: false,
							})
						: null,
				};
			}),
		);
		return c.json({
			success: true,
			leaderboard: detailedLeaderboard,
		});
	} catch (err) {
		container.logger.error(
			`[vote-api] Error fetching leaderboard: ${err.message || err}`,
			{
				label: 'api',
			},
		);
		return c.json(
			{
				success: false,
				error: err.message,
			},
			500,
		);
	}
});

// =============================================================================
// GET /api/vote/user/:userId
// Returns vote info for a specific user
// =============================================================================
app.get('/user/:userId', async (c) => {
	const userId = c.req.param('userId');
	const container = c.get('container');
	const { models } = container;
	const { KythiaUser } = models;
	try {
		const user = await KythiaUser.getCache({
			userId,
		});
		return c.json({
			success: true,
			user: user
				? {
						userId: user.userId,
						votePoints: user.votePoints || 0,
						isVoted: user.isVoted || false,
						voteExpiresAt: user.voteExpiresAt || null,
					}
				: {
						userId,
						votePoints: 0,
						isVoted: false,
						voteExpiresAt: null,
					},
		});
	} catch (err) {
		return c.json(
			{
				success: false,
				error: err.message,
			},
			500,
		);
	}
});

// =============================================================================
// PATCH /api/vote/user/:userId/points
// Increment or decrement a user's vote points
// Body: { increment?: number, decrement?: number }
// =============================================================================
app.patch('/user/:userId/points', async (c) => {
	const userId = c.req.param('userId');
	const { increment, decrement } = await c.req.json().catch(() => ({}));
	const container = c.get('container');
	const { models } = container;
	const { KythiaUser } = models;
	try {
		const [user] = await KythiaUser.getOrCreateCache(
			{
				where: {
					userId,
				},
			},
			{
				userId,
				votePoints: 0,
			},
		);
		if (typeof increment === 'number') {
			user.votePoints = (user.votePoints || 0) + increment;
		} else if (typeof decrement === 'number') {
			user.votePoints = Math.max(0, (user.votePoints || 0) - decrement);
		} else {
			return c.json(
				{
					success: false,
					error: 'Must provide increment or decrement',
				},
				400,
			);
		}
		await user.save();
		await KythiaUser.clearCache({
			userId,
		});
		return c.json({
			success: true,
			votePoints: user.votePoints,
		});
	} catch (err) {
		container.logger.error(
			`[vote-api] Error patching points for ${userId}: ${err.message || err}`,
			{
				label: 'api',
			},
		);
		return c.json(
			{
				success: false,
				error: err.message,
			},
			500,
		);
	}
});

// =============================================================================
// PUT /api/vote/user/:userId/points
// Set a user's vote points exactly
// Body: { points: number }
// =============================================================================
app.put('/user/:userId/points', async (c) => {
	const userId = c.req.param('userId');
	const { points } = await c.req.json().catch(() => ({}));
	const container = c.get('container');
	const { models } = container;
	const { KythiaUser } = models;
	if (typeof points !== 'number' || points < 0) {
		return c.json(
			{
				success: false,
				error: 'Valid points number required',
			},
			400,
		);
	}
	try {
		const [user] = await KythiaUser.getOrCreateCache(
			{
				where: {
					userId,
				},
			},
			{
				userId,
				votePoints: points,
			},
		);
		user.votePoints = points;
		await user.save();
		await KythiaUser.clearCache({
			userId,
		});
		return c.json({
			success: true,
			votePoints: user.votePoints,
		});
	} catch (err) {
		container.logger.error(
			`[vote-api] Error putting points for ${userId}: ${err.message || err}`,
			{
				label: 'api',
			},
		);
		return c.json(
			{
				success: false,
				error: err.message,
			},
			500,
		);
	}
});

// =============================================================================
// DELETE /api/vote/user/:userId/points
// Reset a user's vote points to 0
// =============================================================================
app.delete('/user/:userId/points', async (c) => {
	const userId = c.req.param('userId');
	const container = c.get('container');
	const { models } = container;
	const { KythiaUser } = models;
	try {
		const user = await KythiaUser.getCache({
			where: {
				userId,
			},
		});
		if (user) {
			user.votePoints = 0;
			await user.save();
		}
		await KythiaUser.clearCache({
			userId,
		});
		return c.json({
			success: true,
			votePoints: 0,
		});
	} catch (err) {
		container.logger.error(
			`[vote-api] Error deleting points for ${userId}: ${err.message || err}`,
			{
				label: 'api',
			},
		);
		return c.json(
			{
				success: false,
				error: err.message,
			},
			500,
		);
	}
});

// =============================================================================
// PUT /api/vote/user/:userId/status
// Set a user's active vote status
// Body: { expiresAt?: string } (ISO Date string, defaults to +12h)
// =============================================================================
app.put('/user/:userId/status', async (c) => {
	const userId = c.req.param('userId');
	const body = await c.req.json().catch(() => ({}));
	const container = c.get('container');
	const { models } = container;
	const { KythiaUser } = models;
	try {
		const [user] = await KythiaUser.getOrCreateCache(
			{
				where: {
					userId,
				},
			},
			{
				userId,
				votePoints: 0,
			},
		);
		user.isVoted = true;
		if (body.expiresAt) {
			user.voteExpiresAt = new Date(body.expiresAt);
		} else {
			const expiresAt = new Date();
			expiresAt.setHours(expiresAt.getHours() + 12);
			user.voteExpiresAt = expiresAt;
		}
		await user.save();
		await KythiaUser.clearCache({
			userId,
		});
		return c.json({
			success: true,
			isVoted: user.isVoted,
			voteExpiresAt: user.voteExpiresAt,
		});
	} catch (err) {
		container.logger.error(
			`[vote-api] Error putting status for ${userId}: ${err.message || err}`,
			{
				label: 'api',
			},
		);
		return c.json(
			{
				success: false,
				error: err.message,
			},
			500,
		);
	}
});

// =============================================================================
// DELETE /api/vote/user/:userId/status
// Remove a user's active vote status
// =============================================================================
app.delete('/user/:userId/status', async (c) => {
	const userId = c.req.param('userId');
	const container = c.get('container');
	const { models } = container;
	const { KythiaUser } = models;
	try {
		const user = await KythiaUser.getCache({
			where: {
				userId,
			},
		});
		if (user) {
			user.isVoted = false;
			user.voteExpiresAt = null;
			await user.save();
		}
		await KythiaUser.clearCache({
			userId,
		});
		return c.json({
			success: true,
			isVoted: false,
			voteExpiresAt: null,
		});
	} catch (err) {
		container.logger.error(
			`[vote-api] Error deleting status for ${userId}: ${err.message || err}`,
			{
				label: 'api',
			},
		);
		return c.json(
			{
				success: false,
				error: err.message,
			},
			500,
		);
	}
});
module.exports = app;
