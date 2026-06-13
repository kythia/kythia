/**
 * @namespace: addons/api/routes/guilds/index.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Hono } = require('hono');
const {
	broadcastGetGuilds,
	broadcastFindGuild,
	broadcastGetGuildMembers,
} = require('../../helpers/shard');

const app = new Hono();

app.get('/', async (c) => {
	const client = c.get('client');

	const guilds = await broadcastGetGuilds(client);

	return c.json(guilds);
});

app.get('/:id', async (c) => {
	const client = c.get('client');
	const container = client.container;
	const { models } = container;
	const { ServerSetting } = models;
	const guildId = c.req.param('id');
	const dataParam = c.req.query('data');

	const shardData = await broadcastFindGuild(client, guildId);

	if (!shardData) {
		return c.json({ error: 'Bot is not in this guild' }, 404);
	}

	const [settings] = await ServerSetting.findOrCreateWithCache({
		where: { guildId },
		defaults: {
			guildId,
			guildName: guildId,
		},
	});

	const { guild, channels, roles, botUser } = shardData;

	const responseGuild =
		dataParam === 'all'
			? guild
			: { id: guild.id, name: guild.name, icon: guild.icon };

	const { getGuildPremiumTier } = container.helpers.premiumServer;
	const kythiaPremiumTier = await getGuildPremiumTier(guildId, models);

	return c.json({
		guild: responseGuild,
		settings,
		channels,
		roles,
		botUser,
		kythiaPremiumTier,
	});
});

app.get('/:id/members', async (c) => {
	const client = c.get('client');
	const guildId = c.req.param('id');
	const isDetailed = c.req.query('all') === 'true';

	const members = await broadcastGetGuildMembers(client, guildId, isDetailed);

	if (!members) {
		return c.json(
			{ error: 'Bot is not in this guild or could not fetch members' },
			404,
		);
	}

	return c.json({ members });
});

module.exports = app;
