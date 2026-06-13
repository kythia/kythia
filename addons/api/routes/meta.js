/**
 * @namespace: addons/api/routes/meta.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Locale } = require('discord.js');
const { Hono } = require('hono');
const { Op } = require('sequelize');
const path = require('node:path');
const fs = require('node:fs');
const { getCommandsData } = require('../helpers/commands');
const { parseChangelog } = require('../helpers/changelog');
const {
	broadcastGetMeta,
	broadcastGetDetailedShards,
} = require('../helpers/shard');
const { getAddonStatuses } = require('../helpers/addons');

const app = new Hono();

function getKythiaCoreVersion() {
	try {
		const corePkgPath = require.resolve('kythia-core/package.json');
		const pkg = JSON.parse(fs.readFileSync(corePkgPath, 'utf8'));
		return pkg.version;
	} catch {
		try {
			const mainPkgPath = path.join(process.cwd(), 'package.json');
			if (fs.existsSync(mainPkgPath)) {
				const mainPkg = JSON.parse(fs.readFileSync(mainPkgPath, 'utf8'));
				return (
					mainPkg.dependencies?.['kythia-core'] ||
					mainPkg.devDependencies?.['kythia-core'] ||
					null
				);
			}
		} catch {}
	}
	return null;
}

// function getKythiaVersion() {
// 	const kythiaVersion = kythiaConfig.version;
// }

app.get('/stats', async (c) => {
	const client = c.get('client');

	const { totalServers, totalMembers, totalMemory } =
		await broadcastGetMeta(client);

	const { totalCommands } = await getCommandsData(client);

	const config = c.get('config') ?? client.container.kythiaConfig;
	const statuses = getAddonStatuses(config);
	const activeAddons = statuses.filter((a) => a.active).length;
	const inactiveAddons = statuses.filter((a) => !a.active).length;
	const addons = {
		total: statuses.length,
		active: activeAddons,
		inactive: inactiveAddons,
	};

	return c.json({
		totalServers,
		totalMembers,
		uptime: client.container.shutdownManager?.getMasterUptime() ?? '0s',
		ping: client.ws.ping,
		ram_usage: `${(totalMemory / 1024 / 1024).toFixed(2)} MB`,
		coreVersion: getKythiaCoreVersion(),
		version: client.container.kythiaConfig.version,
		totalCommands,
		addons,
	});
});

app.get('/shards', async (c) => {
	const client = c.get('client');

	try {
		const shards = await broadcastGetDetailedShards(client);
		return c.json({ shards, totalShards: shards.length });
	} catch (error) {
		return c.json({ error: `Failed to fetch shards info: ${error}` }, 500);
	}
});

app.get('/commands', async (c) => {
	const client = c.get('client');
	try {
		const { commands, categories, totalCommands } =
			await getCommandsData(client);
		return c.json({ commands, categories, totalCommands });
	} catch (error) {
		return c.json({ error: `Failed to fetch commands: ${error}` }, 500);
	}
});

app.get('/changelog', (c) => {
	try {
		const changelogPath = path.join(process.cwd(), 'changelog.md');
		const changelogMd = fs.readFileSync(changelogPath, 'utf-8');
		const parsed = parseChangelog(changelogMd);
		return c.json(parsed);
	} catch (error) {
		return c.json({ error: `Changelog not found: ${error}` }, 404);
	}
});

app.get('/locales', (c) => {
	const client = c.get('client');
	try {
		const localeMap = Object.entries(Locale).reduce((acc, [name, key]) => {
			acc[key] = name;
			return acc;
		}, {});

		const loadedKeys = Array.from(
			client.container.translator.getLocales().keys(),
		);
		const locales = loadedKeys.map((key) => {
			const rawName = localeMap[key] || 'Unknown';
			return {
				locale: key,
				name: rawName.replace(/([a-z])([A-Z])/g, '$1 $2'),
			};
		});

		return c.json({
			success: true,
			count: locales.length,
			locales,
		});
	} catch (error) {
		return c.json(
			{ success: false, error: `Failed to fetch locales: ${error}` },
			500,
		);
	}
});

app.get('/logs', (c) => {
	try {
		const levelQuery = c.req.query('level');
		const levels = levelQuery
			? levelQuery.split(',').map((l) => l.trim().toLowerCase())
			: null;
		let limit = parseInt(c.req.query('limit'), 10);
		if (Number.isNaN(limit) || limit <= 0) limit = 100;
		limit = Math.min(limit, 1000);

		const logsDir = path.join(process.cwd(), 'logs');
		if (!fs.existsSync(logsDir)) {
			return c.json({ logs: [] });
		}

		const files = fs
			.readdirSync(logsDir)
			.filter((f) => f.endsWith('-combined.log'))
			.sort()
			.reverse();

		if (files.length === 0) {
			return c.json({ logs: [] });
		}

		const latestLogFile = path.join(logsDir, files[0]);
		const fileContent = fs.readFileSync(latestLogFile, 'utf-8');
		const lines = fileContent.split('\n').filter(Boolean).reverse();

		const parsedLogs = [];
		for (const line of lines) {
			if (parsedLogs.length >= limit) break;
			try {
				const logEntry = JSON.parse(line);
				if (levels && !levels.includes(logEntry.level?.toLowerCase())) continue;
				parsedLogs.push(logEntry);
			} catch (_e) {
				// Ignore malformed lines
			}
		}

		return c.json({
			success: true,
			count: parsedLogs.length,
			logs: parsedLogs,
		});
	} catch (error) {
		return c.json(
			{ success: false, error: `Failed to fetch logs: ${error}` },
			500,
		);
	}
});

// =============================================================================
// GET /api/meta/growth — Bot server-count growth over time (chart data)
// Query: days=30 (1-365), granularity=day|week|month
// =============================================================================
app.get('/growth', async (c) => {
	const client = c.get('client');
	const { models } = client.container;
	const { BotGrowthSnapshot } = models;

	if (!BotGrowthSnapshot) {
		return c.json(
			{ success: false, error: 'BotGrowthSnapshot model not loaded' },
			503,
		);
	}

	let days = parseInt(c.req.query('days') || '30', 10);
	if (Number.isNaN(days) || days < 1) days = 30;
	if (days > 365) days = 365;

	const granularity = c.req.query('granularity') || 'day';
	if (!['day', 'week', 'month'].includes(granularity)) {
		return c.json(
			{ success: false, error: 'granularity must be day, week, or month' },
			400,
		);
	}

	try {
		const from = new Date();
		from.setDate(from.getDate() - days);
		from.setHours(0, 0, 0, 0);

		const rows = await BotGrowthSnapshot.getAllCache({
			where: {
				createdAt: { [Op.gte]: from },
			},
			order: [['createdAt', 'ASC']],
		});

		// ── Group rows into time buckets ──────────────────────────────────────
		function getBucketKey(date) {
			const d = new Date(date);
			if (granularity === 'month') {
				return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
			}
			if (granularity === 'week') {
				// ISO week start: Monday
				const day = d.getUTCDay() || 7;
				const monday = new Date(d);
				monday.setUTCDate(d.getUTCDate() - day + 1);
				return monday.toISOString().slice(0, 10);
			}
			// day
			return d.toISOString().slice(0, 10);
		}

		const buckets = new Map();

		for (const row of rows) {
			const key = getBucketKey(row.createdAt);
			if (!buckets.has(key)) {
				buckets.set(key, { date: key, joins: 0, leaves: 0, totalGuilds: 0 });
			}
			const bucket = buckets.get(key);
			if (row.event === 'join') bucket.joins += 1;
			if (row.event === 'leave') bucket.leaves += 1;
			// Always take the latest totalGuilds within the bucket
			bucket.totalGuilds = row.totalGuilds;
		}

		const chart = Array.from(buckets.values()).map((b) => ({
			date: b.date,
			joins: b.joins,
			leaves: b.leaves,
			net: b.joins - b.leaves,
			totalGuilds: b.totalGuilds,
		}));

		const totalJoins = chart.reduce((s, b) => s + b.joins, 0);
		const totalLeaves = chart.reduce((s, b) => s + b.leaves, 0);

		// Live current guild count from Discord cache (cross-shard via broadcastGetMeta)
		const { totalServers } = await broadcastGetMeta(client).catch(() => ({
			totalServers: client.guilds.cache.size,
		}));

		return c.json({
			success: true,
			period: {
				from: from.toISOString().slice(0, 10),
				to: new Date().toISOString().slice(0, 10),
				days,
				granularity,
			},
			current: {
				totalGuilds: totalServers,
			},
			summary: {
				totalJoins,
				totalLeaves,
				netGrowth: totalJoins - totalLeaves,
			},
			chart,
		});
	} catch (error) {
		return c.json(
			{
				success: false,
				error: `Failed to fetch growth data: ${error.message}`,
			},
			500,
		);
	}
});

// =============================================================================
// GET /api/meta/premium-tiers — Get all premium tiers
// =============================================================================
app.get('/premium-tiers', (c) => {
	try {
		const TIERS = require('@coreHelpers/premium-tiers');
		// Convert BigInts to strings so JSON.stringify doesn't crash
		const serializedTiers = {};
		for (const [key, data] of Object.entries(TIERS)) {
			serializedTiers[key] = { ...data };
			if (data.prices) {
				serializedTiers[key].prices = {};
				for (const [days, price] of Object.entries(data.prices)) {
					serializedTiers[key].prices[days] = price.toString();
				}
			}
		}

		return c.json({
			success: true,
			data: serializedTiers,
		});
	} catch (error) {
		return c.json(
			{
				success: false,
				error: `Failed to fetch premium tiers: ${error.message}`,
			},
			500,
		);
	}
});

module.exports = app;
