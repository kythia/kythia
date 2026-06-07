/**
 * @namespace: addons/globalchat/tasks/webhook-health-check.js
 * @type: Scheduled Task
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const fetch = require('node-fetch');
const { handleFailedGlobalChat } = require('../helpers/handleFailedGlobalChat');

/**
 * Sleep for ms milliseconds
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
	taskName: 'webhook-health-check',
	schedule: '* */30 * * *', // Every 30 minutes
	execute: async (container) => {
		const { logger, models, kythiaConfig, client } = container;
		const { GlobalChat } = models;
		const { ShardClientUtil } = require('discord.js');

		const apiUrl = kythiaConfig.addons.globalchat.apiUrl;
		const apiKey = kythiaConfig.addons.globalchat.apiKey;
		const checkDelayMs =
			kythiaConfig.addons.globalchat.healthCheckDelay || 1000;

		logger.info('Starting webhook health check (API+DB sync, then probe)...', {
			label: 'global chat',
		});

		// Step 1: Get list from API
		let apiGuilds;
		try {
			const apiRes = await fetch(`${apiUrl}/list`, {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${apiKey}`,
				},
			});
			if (!apiRes.ok)
				throw new Error(`API /list returned status ${apiRes.status}`);
			const apiData = await apiRes.json();
			if (apiData.status !== 'ok' || !Array.isArray(apiData.data?.guilds)) {
				throw new Error(
					`API /list failed or returned invalid data: ${apiData.message || apiData.error || 'Unknown error'}`,
				);
			}
			apiGuilds = apiData.data.guilds;
		} catch (apiErr) {
			logger.warn(
				`Failed to fetch /list from API: ${apiErr.message || apiErr}`,
				{
					label: 'global chat',
				},
			);
			return;
		}

		// Step 2: Get local DB list
		let dbGuilds;
		try {
			dbGuilds = await GlobalChat.getAllCache();
		} catch (err) {
			logger.error(
				`Failed to fetch guild list from local DB: ${err.message || err}`,
				{
					label: 'global chat',
				},
			);
			return;
		}

		// Sanity: Prepare guild sets for easier lookup
		const dbGuildMap = new Map(dbGuilds.map((g) => [g.guildId, g]));
		const apiGuildMap = new Map(apiGuilds.map((g) => [g.id, g]));

		// Step 3: Compare and sync: Are all API guilds also in DB?
		// If API has a guild that's missing or badly out of sync DB, warn/fix.
		for (const apiGuild of apiGuilds) {
			if (client.shard) {
				const expectedShardId = ShardClientUtil.shardIdForGuildId(
					apiGuild.id,
					client.shard.count,
				);
				if (!client.shard.ids.includes(expectedShardId)) continue;
			}

			const dbEntry = dbGuildMap.get(apiGuild.id);

			const shouldUpdate =
				!dbEntry ||
				dbEntry.globalChannelId !== apiGuild.globalChannelId ||
				dbEntry.webhookId !== apiGuild.webhookId ||
				dbEntry.webhookToken !== apiGuild.webhookToken;

			if (shouldUpdate) {
				logger.warn(
					`DB desync: Entry for ${apiGuild.guildName || apiGuild.id} is missing/out-of-date vs API. Will update local DB cache.`,
					{ label: 'global chat' },
				);
				try {
					await GlobalChat.updateOrCreateCache(
						{ guildId: apiGuild.id },
						{
							guildName: apiGuild.guildName,
							globalChannelId: apiGuild.globalChannelId,
							webhookId: apiGuild.webhookId,
							webhookToken: apiGuild.webhookToken,
						},
					);
				} catch (err) {
					logger.error(
						`Failed to update DB from API for guild ${apiGuild.id}: ${err.message || err}`,
						{ label: 'global chat' },
					);
				}
			}
		}

		// Step 4: Health check all webhooks (only for guilds we are still in)
		const managedGuildsToCheck = dbGuilds.filter((g) =>
			client.guilds.cache.has(g.guildId),
		);

		logger.info(
			`Checking webhook health for ${managedGuildsToCheck.length} guild(s) in our local DB...`,
			{ label: 'global chat' },
		);

		for (const guildInfo of managedGuildsToCheck) {
			// Only check if present in API as well (should be after sync above, but extra safety)
			const apiGuild = apiGuildMap.get(guildInfo.guildId);
			if (!apiGuild) {
				logger.warn(
					`Skipping guild ${guildInfo.guildId}: not present in latest API list.`,
					{ label: 'global chat' },
				);
				continue;
			}

			try {
				const webhookUrl = `https://discord.com/api/webhooks/${guildInfo.webhookId}/${guildInfo.webhookToken}`;
				const webhookRes = await fetch(webhookUrl);

				if (webhookRes.status === 404) {
					logger.warn(
						`DEAD webhook (404) for guild ${guildInfo.guildName || guildInfo.guildId}. Will trigger self-heal!`,
						{ label: 'global chat' },
					);
					const failedGuild = {
						guildId: guildInfo.guildId,
						guildName:
							guildInfo.guildName ||
							(await client.guilds.fetch(guildInfo.guildId).catch(() => null))
								?.name ||
							guildInfo.guildId,
						error: 'Proactive check failed: 404 Not Found',
					};
					handleFailedGlobalChat([failedGuild], container).catch((err) => {
						logger.error(`Self-heal attempt failed: ${err.message || err}`, {
							label: 'global chat',
						});
					});
				} else if (!webhookRes.ok) {
					logger.warn(
						`Webhook for ${guildInfo.guildId} returned non-OK status: ${webhookRes.status}`,
						{ label: 'global chat' },
					);
				}
			} catch (fetchErr) {
				logger.error(
					`Error fetching webhook for guild ${guildInfo.guildId}: ${fetchErr.message || fetchErr}`,
					{ label: 'global chat' },
				);
			}
			await sleep(checkDelayMs);
		}

		logger.info('Webhook health check (API+DB sync & probe) finished.', {
			label: 'global chat',
		});
	},
};
