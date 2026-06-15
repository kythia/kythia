/**
 * @namespace: addons/api/routes/minecraft.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Hono } = require('hono');
const { ChannelType, PermissionFlagsBits } = require('discord.js');
const {
	fetchMcStatus,
	runMinecraftStatsUpdater,
} = require('../../minecraft/helpers/mcstats');

const app = new Hono();

const getClient = (c) => c.get('client');
const getContainer = (c) => getClient(c).container;
const getModels = (c) => getContainer(c).models;

// =============================================================================
// GET /api/minecraft/status/raw?host=&port=
// Query any MC server directly without requiring a guild
// =============================================================================
app.get('/status/raw', async (c) => {
	const host = c.req.query('host');
	const port = parseInt(c.req.query('port') ?? '25565', 10);

	if (!host) {
		return c.json(
			{ success: false, error: 'Missing required query param: host' },
			400,
		);
	}

	try {
		const data = await fetchMcStatus(host, port);
		return c.json({ success: true, data });
	} catch (err) {
		return c.json({ success: false, error: err.message }, 502);
	}
});

// =============================================================================
// GET /api/minecraft/status/:guildId
// Fetch server status using the guild's configured IP/port
// =============================================================================
app.get('/status/:guildId', async (c) => {
	const { ServerSetting } = getModels(c);
	const guildId = c.req.param('guildId');

	try {
		const [settings] = await ServerSetting.findOrCreateCache({
			where: { guildId },
			defaults: {
				guildId,
				guildName: guildId,
			},
		});
		if (!settings.minecraftIp)
			return c.json(
				{
					success: false,
					error: 'No Minecraft server configured for this guild',
				},
				404,
			);

		const host = settings.minecraftIp;
		const port = settings.minecraftPort ?? 25565;

		const data = await fetchMcStatus(host, port);
		return c.json({
			success: true,
			host,
			port,
			data,
		});
	} catch (err) {
		return c.json({ success: false, error: err.message }, 502);
	}
});

// =============================================================================
// GET /api/minecraft/settings/:guildId
// Returns the MC-related fields from ServerSetting
// =============================================================================
app.get('/settings/:guildId', async (c) => {
	const { ServerSetting } = getModels(c);
	const guildId = c.req.param('guildId');

	try {
		const [settings] = await ServerSetting.findOrCreateCache({
			where: { guildId },
			defaults: {
				guildId,
				guildName: guildId,
			},
		});

		return c.json({
			success: true,
			data: {
				minecraftStatsOn: settings.minecraftStatsOn ?? false,
				minecraftIp: settings.minecraftIp ?? null,
				minecraftPort: settings.minecraftPort ?? 25565,
				minecraftIpChannelId: settings.minecraftIpChannelId ?? null,
				minecraftPortChannelId: settings.minecraftPortChannelId ?? null,
				minecraftStatusChannelId: settings.minecraftStatusChannelId ?? null,
				minecraftPlayersChannelId: settings.minecraftPlayersChannelId ?? null,
			},
		});
	} catch (err) {
		return c.json({ success: false, error: err.message }, 500);
	}
});

// =============================================================================
// PATCH /api/minecraft/settings/:guildId
// Update any MC-related setting fields
// Body: { minecraftIp?, minecraftPort?, minecraftStatsOn?,
//          minecraftIpChannelId?, minecraftPortChannelId?,
//          minecraftStatusChannelId?, minecraftPlayersChannelId? }
// =============================================================================
app.patch('/settings/:guildId', async (c) => {
	const { ServerSetting } = getModels(c);
	const guildId = c.req.param('guildId');
	const body = await c.req.json();

	const ALLOWED = [
		'minecraftStatsOn',
		'minecraftIp',
		'minecraftPort',
		'minecraftIpChannelId',
		'minecraftPortChannelId',
		'minecraftStatusChannelId',
		'minecraftPlayersChannelId',
	];

	try {
		const [settings] = await ServerSetting.findOrCreateCache({
			where: { guildId },
			defaults: { guildId },
		});

		for (const key of ALLOWED) {
			if (key in body) settings[key] = body[key];
		}

		await settings.save();
		return c.json({ success: true, data: settings });
	} catch (err) {
		return c.json({ success: false, error: err.message }, 500);
	}
});

// =============================================================================
// POST /api/minecraft/autosetup/:guildId
// Mirror the /minecraft set autosetup Discord command via API.
// Creates category + 4 voice channels, saves settings, enables stats.
// Body: { host, port?, categoryName? }
// =============================================================================
app.post('/autosetup/:guildId', async (c) => {
	const client = getClient(c);
	const { ServerSetting } = getModels(c);
	const guildId = c.req.param('guildId');
	const body = await c.req.json();

	const { host, port: rawPort, categoryName } = body;
	const port = parseInt(rawPort ?? '25565', 10);

	if (!host) {
		return c.json(
			{ success: false, error: 'Missing required field: host' },
			400,
		);
	}

	try {
		// 1. Fetch initial status (best-effort)
		let initialData = null;
		try {
			initialData = await fetchMcStatus(host, port);
		} catch {
			/* offline is fine */
		}

		const isOnline = initialData?.online ?? false;
		const onlinePlayers = isOnline ? (initialData?.players?.online ?? 0) : 0;
		const maxPlayers = isOnline ? (initialData?.players?.max ?? 0) : 0;

		// 2 & 3. Create category and channels on the correct shard
		let setupResult = null;

		const createChannelsLogic = async (c, context) => {
			const g = c.guilds.cache.get(context.guildId);
			if (!g) return null;

			const category = await g.channels.create({
				name: context.categoryName ?? '⛏️ Minecraft Server',
				type: ChannelType.GuildCategory,
				reason: 'Minecraft Stats Auto-Setup (API)',
			});

			const channelDefs = [
				{ name: `🖥️ IP: ${context.host}`, field: 'minecraftIpChannelId' },
				{ name: `🔌 Port: ${context.port}`, field: 'minecraftPortChannelId' },
				{
					name: context.isOnline ? `🟢 Online` : '🔴 Offline',
					field: 'minecraftStatusChannelId',
				},
				{
					name: context.isOnline
						? `👥 ${context.onlinePlayers}/${context.maxPlayers}`
						: '👥 —/—',
					field: 'minecraftPlayersChannelId',
				},
			];

			const createdChannels = {};
			for (const def of channelDefs) {
				try {
					const ch = await g.channels.create({
						name: def.name,
						type: ChannelType.GuildVoice,
						parent: category.id,
						permissionOverwrites: [
							{
								id: g.roles.everyone.id,
								deny: [PermissionFlagsBits.Connect],
							},
						],
						reason: 'Minecraft Stats Auto-Setup (API)',
					});
					createdChannels[def.field] = ch.id;
				} catch {
					/* best-effort */
				}
			}

			return {
				categoryId: category.id,
				channels: createdChannels,
				guildName: g.name,
			};
		};

		if (client.shard) {
			const results = await client.shard.broadcastEval(createChannelsLogic, {
				context: {
					guildId,
					host,
					port,
					categoryName,
					isOnline,
					onlinePlayers,
					maxPlayers,
				},
			});
			setupResult = results.find((r) => r !== null);
		} else {
			setupResult = await createChannelsLogic(client, {
				guildId,
				host,
				port,
				categoryName,
				isOnline,
				onlinePlayers,
				maxPlayers,
			});
		}

		if (!setupResult) {
			return c.json(
				{ success: false, error: 'Guild not found on any shard' },
				404,
			);
		}

		// 4. Save to ServerSetting
		const [settings] = await ServerSetting.findOrCreateCache({
			where: { guildId },
			defaults: { guildId, guildName: setupResult.guildName },
		});

		settings.minecraftIp = host;
		settings.minecraftPort = port;
		settings.minecraftStatsOn = true;
		for (const [field, channelId] of Object.entries(setupResult.channels)) {
			settings[field] = channelId;
		}
		await settings.save();

		return c.json({
			success: true,
			data: {
				categoryId: setupResult.categoryId,
				host,
				port,
				channels: setupResult.channels,
			},
		});
	} catch (err) {
		return c.json({ success: false, error: err.message }, 500);
	}
});

// =============================================================================
// POST /api/minecraft/trigger-update/:guildId
// Force an immediate stat channel update for a single guild
// (or all guilds if guildId is "all")
// =============================================================================
app.post('/trigger-update/:guildId', async (c) => {
	const client = getClient(c);
	const { ServerSetting } = getModels(c);
	const { logger } = getContainer(c);
	const guildId = c.req.param('guildId');

	try {
		if (guildId === 'all') {
			// Fire and forget — run the full updater cycle in background
			runMinecraftStatsUpdater(client).catch((e) =>
				logger.error(`trigger-update all failed: ${e.message || e}`, {
					label: 'mc-api',
				}),
			);
			return c.json({
				success: true,
				message: 'Update cycle triggered for all guilds',
			});
		}

		const settings = await ServerSetting.getCache({ guildId });
		if (!settings?.minecraftIp) {
			return c.json(
				{
					success: false,
					error: 'No Minecraft server configured for this guild',
				},
				404,
			);
		}

		// Run updater for this single guild
		runMinecraftStatsUpdater(client, [settings]).catch((e) =>
			logger.error(
				`[MC API] trigger-update ${guildId} failed: ${e.message || e}`,
				{ label: 'mc-api' },
			),
		);
		return c.json({
			success: true,
			message: `Update triggered for guild ${guildId}`,
		});
	} catch (err) {
		return c.json({ success: false, error: err.message }, 500);
	}
});

module.exports = app;
