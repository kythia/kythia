/**
 * @namespace: addons/api/routes/guilds/branding.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Hono } = require('hono');
const {
	broadcastFindGuild,
	broadcastEditMember,
} = require('../../helpers/shard');

const app = new Hono();

app.get('/:guildId', async (c) => {
	const client = c.get('client');
	const container = client.container;
	const { models } = container;
	const { ServerSetting } = models;
	const guildId = c.req.param('guildId');

	// Fetch saved branding + live bot member info in parallel
	const [settings, shardData] = await Promise.all([
		ServerSetting.getCache({ where: { guildId } }),
		broadcastFindGuild(client, guildId),
	]);

	if (!shardData) return c.json({ error: 'Guild not found' }, 404);

	const { botUser } = shardData;

	// Resolve each field: saved value → live Discord default → null
	return c.json({
		success: true,
		data: {
			nickname: settings?.botName ?? botUser.username ?? null,
			avatar: settings?.botAvatarUrl ?? botUser.avatar ?? null,
			banner: settings?.botBannerUrl ?? botUser.banner ?? null,
			bio: settings?.botBio ?? botUser.bio ?? null,
		},
	});
});

app.patch('/:guildId', async (c) => {
	const client = c.get('client');
	const container = client.container;
	const { models, logger } = container;
	const { ServerSetting } = models;
	const guildId = c.req.param('guildId');
	const body = await c.req.json();

	// Verify bot is in the guild (cross-shard aware)
	const shardData = await broadcastFindGuild(client, guildId);
	if (!shardData) return c.json({ error: 'Guild not found' }, 404);

	try {
		const updatePayload = {};

		if (body.nickname !== undefined) {
			updatePayload.nick = body.nickname || null;
		}

		if (body.avatar !== undefined) {
			updatePayload.avatar = body.avatar || null;
		}

		if (body.banner !== undefined) {
			updatePayload.banner = body.banner || null;
		}

		if (body.bio !== undefined) {
			updatePayload.bio = body.bio || null;
		}

		if (Object.keys(updatePayload).length > 0) {
			// Edit the bot member on whichever shard owns this guild
			await broadcastEditMember(client, guildId, updatePayload);
		}

		const [settings] = await ServerSetting.findOrCreateCache({
			where: { guildId },
			defaults: {
				guildId,
				guildName: shardData.guild.name,
			},
		});

		await settings.update({
			botName: body.nickname,
			botAvatarUrl: body.avatar,
			botBannerUrl: body.banner,
			botBio: body.bio,
		});

		return c.json({ success: true });
	} catch (e) {
		logger.error(`Error: ${e.message || e}`, { label: 'api' });

		if (e.code === 50013) {
			return c.json(
				{ error: 'Bot Missing Permissions: Cannot change nickname/avatar.' },
				403,
			);
		}

		return c.json(
			{ error: 'Failed to update bot profile.', details: e.message },
			500,
		);
	}
});

module.exports = app;
