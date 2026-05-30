/**
 * @namespace: addons/server-stats/helpers/stats.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { ChannelType } = require('discord.js');
const Sentry = require('@sentry/node');
const {
	resolvePlaceholders,
	safeResolvePlaceholder,
} = require('@coreHelpers/discord');

async function updateStats(client, activeSettings) {
	const container = client.container;
	const { logger, helpers } = container;
	const { getChannelSafe } = helpers.discord;
	logger.info(`Processing stats for ${activeSettings.length} guild(s)...`, {
		label: 'core',
	});

	for (const setting of activeSettings) {
		if (
			!setting.serverStatsOn ||
			!setting.serverStats ||
			!Array.isArray(setting.serverStats)
		)
			continue;

		const guild = client.guilds.cache.get(setting.guildId);
		if (!guild) continue;

		try {
			const owner = await guild.fetchOwner().catch(() => null);

			const channelTypes = {
				text: 0,
				voice: 0,
				category: 0,
				announcement: 0,
				stage: 0,
			};
			guild.channels.cache.forEach((channel) => {
				switch (channel.type) {
					case ChannelType.GuildText:
						channelTypes.text++;
						break;
					case ChannelType.GuildVoice:
						channelTypes.voice++;
						break;
					case ChannelType.GuildCategory:
						channelTypes.category++;
						break;
					case ChannelType.GuildAnnouncement:
						channelTypes.announcement++;
						break;
					case ChannelType.GuildStageVoice:
						channelTypes.stage++;
						break;
				}
			});

			const data = {
				members: guild.memberCount,
				boosts: guild.premiumSubscriptionCount || 0,
				boostLevel: guild.premiumTier,
				channels: guild.channels.cache.size,
				textChannels: channelTypes.text,
				voiceChannels: channelTypes.voice,
				categories: channelTypes.category,
				announcementChannels: channelTypes.announcement,
				stageChannels: channelTypes.stage,
				roles: guild.roles.cache.size,
				emojis: guild.emojis.cache.size,
				stickers: guild.stickers.cache.size,
				guildName: guild.name,
				guildId: guild.id,
				ownerName: owner ? owner.user.tag : 'Unknown',
				ownerId: guild.ownerId || '0',
				region: guild.preferredLocale,
				verified: guild.verified,
				partnered: guild.partnered,
				createdAt: guild.createdAt ? guild.createdAt.toISOString() : null,
				memberJoin: setting.memberJoin || null,
			};

			const guildUpdatePromises = [];

			for (const stat of setting.serverStats) {
				if (!stat.enabled || !stat.channelId || !stat.format) continue;

				const channel = await getChannelSafe(guild, stat.channelId);
				if (
					!channel ||
					![ChannelType.GuildVoice, ChannelType.GuildStageVoice].includes(
						channel.type,
					) ||
					!channel.manageable
				) {
					continue;
				}

				const newName = await resolvePlaceholders(
					container,
					stat.format,
					data,
					guild.preferredLocale,
				);

				if (channel.name !== newName) {
					guildUpdatePromises.push(
						channel
							.setName(newName.substring(0, 100), 'Server Stats Update')
							.catch((err) => {
								logger.warn(
									`Failed to update channel ${channel.id} in ${guild.name}: ${err.message}`,
									{ label: 'core' },
								);
							}),
					);
				}
			}

			if (guildUpdatePromises.length > 0) {
				await Promise.allSettled(guildUpdatePromises);
				logger.info(
					`Updated ${guildUpdatePromises.length} channel(s) for guild: ${guild.name}`,
					{ label: 'core' },
				);
			}
		} catch (err) {
			logger.error(
				`Failed to process guild ${guild.name} (${setting.guildId}): ${err.message || err}`,
				{ label: 'core' },
			);
			Sentry.captureException(err, { extra: { guildId: guild.id } });
		}
	}

	logger.info(`Finished processing all channel updates.`, { label: 'core' });
}

async function runStatsUpdater(client) {
	const { models, kythiaConfig, logger } = client.container;
	const { ServerSetting } = models;
	logger.info(`📊 Starting server stats update cycle...`, { label: 'core' });
	try {
		const allSettings = await ServerSetting.getAllCache();
		const guildsCache = client.guilds.cache;

		if (!guildsCache) {
			logger.error(
				'❌ client.guilds.cache is unavailable during stats update.',
				{ label: 'core' },
			);
			return;
		}

		const activeSettings = allSettings.filter(
			(s) => guildsCache.has(s.guildId) && s.serverStatsOn,
		);

		if (activeSettings.length === 0) {
			logger.info(
				`📊 No guilds with active server stats. Skipping update cycle.`,
				{ label: 'core' },
			);
			return;
		}

		logger.info(
			`📊 Found ${activeSettings.length} guild(s) to update stats for.`,
			{ label: 'core' },
		);

		await updateStats(client, activeSettings);
		logger.info(`📊 Server stats update cycle finished.`, { label: 'core' });
	} catch (err) {
		logger.error(
			`A critical error occurred in runStatsUpdater: ${err.message}`,
			{ label: 'stats' },
		);
		if (kythiaConfig?.sentry?.dsn) {
			Sentry.captureException(err);
		}
	}
}

module.exports = {
	updateStats,
	resolvePlaceholders,
	safeResolvePlaceholder,
	runStatsUpdater,
};
