/**
 * @namespace: addons/quest/tasks/quest-scheduler.js
 * @type: Scheduled Task
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { buildQuestNotification } = require('../helpers/questHelper');
const { Op } = require('sequelize');

/**
 * Try a list of API URLs and return the first successful quests response.
 * @param {string[]} urls
 * @param {object} logger
 * @returns {Promise<null|Array>} - API Quests array, or null if all fail
 */

async function fetchQuestsFromAny(urls, logger) {
	const TIMEOUT_MS = 5000;

	for (const url of urls) {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => {
			logger.warn(`API timeout (5s) for ${url}. Aborting...`, {
				label: 'questnotifier',
			});
			controller.abort();
		}, TIMEOUT_MS);

		try {
			logger.info(`Trying quest API: ${url}`, { label: 'questnotifier' });

			const response = await fetch(url, {
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				logger.warn(
					`API fetch failed with status ${response.status} for ${url}`,
					{ label: 'questnotifier' },
				);
				continue;
			}

			const apiQuests = await response.json();
			logger.info(`Got quest data from: ${url}`, { label: 'questnotifier' });
			return apiQuests;
		} catch (e) {
			clearTimeout(timeoutId);

			if (e.name === 'AbortError') {
			} else {
				logger.warn(`Error fetching from ${url}: ${e.message}`, {
					label: 'questnotifier',
				});
			}
		}
	}

	return null;
}

module.exports = {
	taskName: 'quest-notifier',
	schedule: '*/30 * * * *', // Every 30 minutes
	execute: async (container) => {
		const { models, logger, client, kythiaConfig } = container;
		const { QuestConfig, QuestGuildLog } = models;
		const { ShardClientUtil } = require('discord.js');
		logger.info(`Running cron job...`, { label: 'questnotifier' });

		const apiUrlsConfig = kythiaConfig.addons.quest.apiUrls || '';

		const apiUrls = apiUrlsConfig
			.split(',')
			.map((v) => v.trim())
			.filter((v) => v.length > 0);

		if (apiUrls.length === 0) {
			logger.warn(`No API URLs configured!`, { label: 'questnotifier' });
			return;
		}

		try {
			const apiQuests = await fetchQuestsFromAny(apiUrls, logger);

			if (!apiQuests) {
				logger.warn(`All API quest endpoints failed. No quests retrieved.`, {
					label: 'questnotifier',
				});
				return;
			}

			const now = new Date();
			const TwodayAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

			const validQuests = apiQuests.filter((quest) => {
				const startsAt = new Date(quest.config.starts_at);
				const expiresAt = new Date(quest.config.expires_at);

				const isExpired = expiresAt < now;
				const isTooOld = startsAt < TwodayAgo;

				return !isExpired && !isTooOld;
			});

			if (validQuests.length === 0) {
				logger.info(`No new quests found.`, { label: 'questnotifier' });
				return;
			}

			const allGuildConfigs = await QuestConfig.getAllCache();
			if (allGuildConfigs.length === 0) {
				logger.info(`No guilds have set up the notifier.`, {
					label: 'questnotifier',
				});
				return;
			}

			const validQuestIds = validQuests.map((q) => q.id);

			const handleMissingAccess = async (configObj) => {
				try {
					await QuestConfig.destroy({ where: { guildId: configObj.guildId } });
					logger.info(
						`Deleted QuestConfig for guild ${configObj.guildId} due to missing permissions.`,
						{ label: 'questnotifier' },
					);
					const guild = await client.guilds
						.fetch(configObj.guildId)
						.catch(() => null);
					if (guild) {
						const targetChannel =
							guild.systemChannel ||
							guild.channels.cache.find(
								(c) =>
									c.isTextBased() &&
									c.permissionsFor(client.user)?.has('SendMessages'),
							);
						if (targetChannel) {
							const mockInteraction = {
								client,
								guildId: configObj.guildId,
								guild,
							};
							const { simpleContainer } = container.helpers.discord;
							const content = await container.t(
								mockInteraction,
								'questnotifier.unset.disabled_no_perms',
							);
							const components = await simpleContainer(
								mockInteraction,
								content,
								{ color: 'Red' },
							);
							await targetChannel.send({ components }).catch(() => {});
						}
					}
				} catch (e) {
					logger.error(
						`Failed to handle missing access for guild ${configObj.guildId}: ${e.message}`,
						{ label: 'questnotifier' },
					);
				}
			};

			for (const config of allGuildConfigs) {
				if (client.shard) {
					const expectedShardId = ShardClientUtil.shardIdForGuildId(
						config.guildId,
						client.shard.count,
					);
					if (!client.shard.ids.includes(expectedShardId)) continue;
				}

				try {
					const channel = await client.channels
						.fetch(config.channelId, { force: true })
						.catch(() => null);
					if (!channel) {
						logger.warn(
							`Channel ${config.channelId} not found for guild ${config.guildId}. Removing config.`,
							{ label: 'questnotifier' },
						);
						await handleMissingAccess(config);
						continue;
					}

					const sentLogs = await QuestGuildLog.getAllCache({
						where: {
							guildId: config.guildId,
							questId: { [Op.in]: validQuestIds },
						},
						attributes: ['questId'],
					});
					const sentQuestIds = new Set(sentLogs.map((log) => log.questId));

					const questsToSend = validQuests.filter(
						(quest) => !sentQuestIds.has(quest.id),
					);

					if (questsToSend.length === 0) continue;

					logger.info(
						`⏰ [QuestNotifier] Sending ${questsToSend.length} new quest(s) to guild ${config.guildId}...`,
						{ label: 'quest' },
					);

					for (const quest of questsToSend) {
						const role = config.roleId ? `<@&${config.roleId}>` : null;
						const { components, flags } = await buildQuestNotification(
							container,
							quest,
							role,
						);

						await channel.send({ components, flags });

						await QuestGuildLog.create({
							guildId: config.guildId,
							questId: quest.id,
						});
					}
				} catch (guildError) {
					logger.error(
						`Failed to process guild ${config.guildId}: ${guildError.message}`,
						{ label: 'questnotifier' },
					);
					if (
						guildError.code === 50013 ||
						guildError.code === 50001 ||
						guildError.message.includes('Missing Permissions') ||
						guildError.message.includes('Missing Access')
					) {
						await handleMissingAccess(config);
					}
				}
			}
			logger.info(`Cron job finished.`, { label: 'questnotifier' });
		} catch (error) {
			logger.error(`CRON JOB FAILED: ${error.message || error}`, {
				label: 'questnotifier',
			});
		}
	},
};
