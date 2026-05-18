/**
 * @namespace: addons/minecraft/helpers/mcstats.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const axios = require('axios');
const Sentry = require('@sentry/node');

const API_BASE = 'https://api.mcsrvstat.us/3';

/**
 * Fetch MC server status from mcsrvstat.us.
 * @param {string} host
 * @param {number} port
 * @returns {Promise<object>}
 */
async function fetchMcStatus(host, port) {
	const url = `${API_BASE}/${host}:${port}`;
	const res = await axios.get(url, { timeout: 10_000 });
	return res.data;
}

/**
 * Safely rename a voice channel (skips if name unchanged or bot lacks perms).
 * @param {import('discord.js').GuildChannel|null} channel
 * @param {string} newName
 * @param {object} logger
 */
async function safeRename(channel, newName, logger) {
	if (!channel?.manageable) return;
	const trimmed = newName.substring(0, 100);
	if (channel.name === trimmed) return;
	try {
		await channel.setName(trimmed, 'Minecraft Stats Update');
	} catch (err) {
		logger.warn(
			`Failed to rename channel ${channel.id}: ${err.message || err}`,
			{
				label: 'mc stats',
			},
		);
	}
}

/**
 * Main updater — called every 5 minutes from register.js cron,
 * or on-demand from the API with an optional pre-filtered settings list.
 * @param {import('discord.js').Client} client
 * @param {Array|null} settingsOverride - If provided, skip the DB query and use this list directly
 */
async function runMinecraftStatsUpdater(client, settingsOverride = null) {
	const { models, logger } = client.container;
	const { ServerSetting } = models;

	logger.info(`⛏️  Starting Minecraft stats update cycle...`, {
		label: 'minecraft',
	});

	try {
		const guildsCache = client.guilds.cache;

		if (!guildsCache) {
			logger.error(
				'❌ client.guilds.cache unavailable during Minecraft stats update.',
				{ label: 'minecraft' },
			);
			return;
		}

		// Use the override list if provided (e.g. from the API trigger-update endpoint),
		// otherwise do the full DB query + filter
		let activeSettings;
		if (settingsOverride) {
			activeSettings = settingsOverride;
		} else {
			const allSettings = await ServerSetting.getAllCache();
			// Only process guilds that have the feature on, an IP set, and at least one display channel
			activeSettings = allSettings.filter(
				(s) =>
					guildsCache.has(s.guildId) &&
					s.minecraftStatsOn &&
					s.minecraftIp &&
					(s.minecraftIpChannelId ||
						s.minecraftPortChannelId ||
						s.minecraftStatusChannelId ||
						s.minecraftPlayersChannelId),
			);
		}

		if (activeSettings.length === 0) {
			logger.info(
				`⛏️  No guilds with active Minecraft stats. Skipping update cycle.`,
				{ label: 'minecraft' },
			);
			return;
		}

		logger.info(
			`⛏️  Found ${activeSettings.length} guild(s) to update Minecraft stats for.`,
			{ label: 'minecraft' },
		);

		for (const setting of activeSettings) {
			const guild = guildsCache.get(setting.guildId);
			if (!guild) continue;

			const host = setting.minecraftIp;
			const port = setting.minecraftPort ?? 25565;

			let data = null;
			try {
				data = await fetchMcStatus(host, port);
			} catch (err) {
				logger.warn(
					`Failed to fetch status for ${host}:${port} (guild: ${guild.name}): ${err.message}`,
					{ label: 'mc stats' },
				);
			}

			const isOnline = data?.online ?? false;
			const onlinePlayers = isOnline ? (data?.players?.online ?? 0) : 0;
			const maxPlayers = isOnline ? (data?.players?.max ?? 0) : 0;

			const channelUpdates = [];

			// IP channel → server IP string
			if (setting.minecraftIpChannelId) {
				const ch = guild.channels.cache.get(setting.minecraftIpChannelId);
				channelUpdates.push(safeRename(ch, host, logger));
			}

			// Port channel → port number
			if (setting.minecraftPortChannelId) {
				const ch = guild.channels.cache.get(setting.minecraftPortChannelId);
				channelUpdates.push(safeRename(ch, String(port), logger));
			}

			// Status channel → "🟢 Online | 12/100" or "🔴 Offline"
			if (setting.minecraftStatusChannelId) {
				const ch = guild.channels.cache.get(setting.minecraftStatusChannelId);
				const statusName = isOnline ? `🟢 Online` : '🔴 Offline';
				channelUpdates.push(safeRename(ch, statusName, logger));
			}

			// Players channel → "👥 12/100" or "👥 —/—"
			if (setting.minecraftPlayersChannelId) {
				const ch = guild.channels.cache.get(setting.minecraftPlayersChannelId);
				const playersName = isOnline
					? `👥 ${onlinePlayers}/${maxPlayers}`
					: '👥 —/—';
				channelUpdates.push(safeRename(ch, playersName, logger));
			}

			try {
				await Promise.allSettled(channelUpdates);
				logger.info(
					`⛏️  Updated Minecraft channels for guild: ${guild.name} (${host}:${port} | online: ${isOnline})`,
					{ label: 'minecraft' },
				);
			} catch (err) {
				logger.error(
					`Failed to update channels for guild ${guild.name}: ${err.message}`,
					{ label: 'mc stats' },
				);
				Sentry.captureException(err, { extra: { guildId: guild.id } });
			}
		}

		logger.info(`⛏️  Minecraft stats update cycle finished.`, {
			label: 'minecraft',
		});
	} catch (err) {
		logger.error(
			`❌ A critical error occurred in runMinecraftStatsUpdater: ${err.message || err}`,
			{ label: 'minecraft' },
		);
		Sentry.captureException(err);
	}
}

module.exports = { runMinecraftStatsUpdater };
