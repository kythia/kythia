/**
 * @namespace: addons/api/routes/meta.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { Locale } = require('discord.js');
const { Hono } = require('hono');
const path = require('node:path');
const fs = require('node:fs');
const { getCommandsData } = require('../helpers/commands');
const { parseChangelog } = require('../helpers/changelog');
const {
	broadcastGetMeta,
	broadcastGetDetailedShards,
} = require('../helpers/shard');

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

app.get('/stats', async (c) => {
	const client = c.get('client');

	const { totalServers, totalMembers, totalMemory } =
		await broadcastGetMeta(client);

	const { totalCommands } = await getCommandsData(client);

	return c.json({
		totalServers,
		totalMembers,
		uptime: client.container.shutdownManager.getMasterUptime(),
		ping: client.ws.ping,
		ram_usage: `${(totalMemory / 1024 / 1024).toFixed(2)} MB`,
		version: getKythiaCoreVersion(),
		totalCommands,
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

module.exports = app;
