/**
 * @namespace: addons/activity/helpers/achievementChecker.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 *
 * Core achievement checker.
 * Call `checkAndUnlock(triggerType, context)` from event handlers.
 * It resolves which achievements need evaluation, checks DB/stats,
 * and unlocks + announces newly earned achievements.
 */

const { Op, fn, col } = require('sequelize');
const achievements = require('./achievements');
const lang = require('../lang/en-US.json');

/**
 * Resolve a dotted i18n key against the lang file.
 * e.g. 'activity.achievement.messages_250.name' → '250 Messages Sent'
 *
 * @param {string} key
 * @returns {string}
 */
function resolveLangKey(key) {
	const parts = key.split('.');
	let node = lang;
	for (const part of parts) {
		if (node && typeof node === 'object' && part in node) {
			node = node[part];
		} else {
			return key; // fallback to raw key
		}
	}
	return typeof node === 'string' ? node : key;
}

/**
 * Flat list of all achievements for counting/collector checks.
 */
const ALL_ACHIEVEMENTS = Object.values(achievements).flat();

/**
 * Condition types that should be re-evaluated on a given trigger.
 * Keys map to the trigger type passed from events.
 */
const TRIGGER_MAP = {
	message: [
		'messages_total',
		'messages_daily',
		'messages_weekly',
		'achievements_count',
	],
	reaction: ['reactions_total', 'achievements_count'],
	voice_join: ['voice_joins', 'server_age_days', 'achievements_count'],
	voice_flush: ['voice_hours', 'achievements_count'],
	server_age: ['server_age_days'],
	meta: ['achievements_count'],
	special: [], // only special flags are checked
};

/**
 * @typedef {Object} CheckContext
 * @property {string} guildId
 * @property {string} userId
 * @property {import('discord.js').Guild} guild
 * @property {import('kythia-core').KythiaDI.Container} container
 * @property {string[]} [specialFlags]  — special achievements to unlock inline
 */

/**
 * Check and unlock achievements for a user based on a trigger type.
 *
 * @param {string} triggerType  — key from TRIGGER_MAP
 * @param {CheckContext} ctx
 */
async function checkAndUnlock(triggerType, ctx) {
	const { guildId, userId, guild, container, specialFlags = [] } = ctx;
	const { models, logger, kythiaConfig, helpers, queueManager } = container;
	const { ActivityStat, ActivityLog, UserAchievement, ServerSetting } = models;

	try {
		// Feature flag
		const serverSetting = await ServerSetting.getCache({ guildId });
		if (!serverSetting?.activityOn) return;

		// Get stat row (may be null for brand-new users)
		const stat = await ActivityStat.getCache({ guildId, userId });

		// Condition values (lazily computed)
		let dailyMessages = null;
		let weeklyMessages = null;
		let achievementCount = null;
		let memberAgeDays = null;

		const getDaily = async () => {
			if (dailyMessages !== null) return dailyMessages;
			const today = new Date().toISOString().slice(0, 10);
			const [row] = await ActivityLog.getAllCache({
				where: { guildId, userId, date: today },
				attributes: [[fn('SUM', col('messages')), 'total']],
				raw: true,
			});
			dailyMessages = row?.total ? Number(row.total) : 0;
			return dailyMessages;
		};

		const getWeekly = async () => {
			if (weeklyMessages !== null) return weeklyMessages;
			const weekAgo = new Date();
			weekAgo.setDate(weekAgo.getDate() - 6);
			const startDate = weekAgo.toISOString().slice(0, 10);
			const [row] = await ActivityLog.getAllCache({
				where: {
					guildId,
					userId,
					date: { [Op.gte]: startDate },
				},
				attributes: [[fn('SUM', col('messages')), 'total']],
				raw: true,
			});
			weeklyMessages = row?.total ? Number(row.total) : 0;
			return weeklyMessages;
		};

		const getAchievementCount = async () => {
			if (achievementCount !== null) return achievementCount;
			achievementCount = await UserAchievement.countWithCache({
				where: { guildId, userId },
			});
			return achievementCount;
		};

		const getMemberAgeDays = async () => {
			if (memberAgeDays !== null) return memberAgeDays;
			try {
				const member =
					guild.members.cache.get(userId) ??
					(await guild.members.fetch(userId).catch(() => null));
				if (!member?.joinedAt) return 0;
				memberAgeDays = Math.floor(
					(Date.now() - member.joinedAt.getTime()) / 86_400_000,
				);
			} catch {
				memberAgeDays = 0;
			}
			return memberAgeDays;
		};

		// Which condition types to evaluate for this trigger
		const conditionTypes = TRIGGER_MAP[triggerType] ?? [];

		// Filter achievements relevant to this trigger
		const candidates = ALL_ACHIEVEMENTS.filter((a) => {
			if (a.condition.type === 'special') {
				return specialFlags.includes(a.condition.flag);
			}
			return conditionTypes.includes(a.condition.type);
		});

		if (candidates.length === 0) return;

		// Load already-unlocked achievement IDs for this user in this guild
		const existing = await UserAchievement.getAllCache({
			where: { guildId, userId },
			attributes: ['achievementId'],
			raw: true,
		});
		const unlockedSet = new Set(existing.map((r) => r.achievementId));

		const toUnlock = [];

		for (const achievement of candidates) {
			if (unlockedSet.has(achievement.id)) continue;

			const { type, value, flag } = achievement.condition;
			let qualifies = false;

			if (type === 'special') {
				qualifies = specialFlags.includes(flag);
			} else if (type === 'messages_total') {
				qualifies = stat ? Number(BigInt(stat.totalMessages)) >= value : false;
			} else if (type === 'messages_daily') {
				qualifies = (await getDaily()) >= value;
			} else if (type === 'messages_weekly') {
				qualifies = (await getWeekly()) >= value;
			} else if (type === 'voice_hours') {
				qualifies = stat
					? Number(BigInt(stat.totalVoiceTime)) >= value * 3600
					: false;
			} else if (type === 'voice_joins') {
				qualifies = stat
					? Number(BigInt(stat.totalVoiceJoins)) >= value
					: false;
			} else if (type === 'reactions_total') {
				qualifies = stat ? Number(BigInt(stat.totalReactions)) >= value : false;
			} else if (type === 'achievements_count') {
				qualifies = (await getAchievementCount()) >= value;
			} else if (type === 'server_age_days') {
				qualifies = (await getMemberAgeDays()) >= value;
			}

			if (qualifies) toUnlock.push(achievement);
		}

		if (toUnlock.length === 0) return;

		// Persist unlocks
		const now = new Date();
		await Promise.all(
			toUnlock.map((a) =>
				UserAchievement.firstOrCreateCache(
					{ guildId, userId, achievementId: a.id },
					{ unlockedAt: now },
				),
			),
		);

		// Invalidate achievement count cache after bulk insert
		await UserAchievement.invalidateCache({ guildId, userId });

		// Get total count for the banner counter
		const totalCount = ALL_ACHIEVEMENTS.length;
		const newUnlockedCount = unlockedSet.size + toUnlock.length;

		// Announce — find the configured channel
		const channelId = serverSetting?.achievementChannelId;
		if (!channelId) return;

		const channel = await helpers.discord
			.getTextChannelSafe(guild, channelId)
			.catch(() => null);
		if (!channel) return;

		// Generate banner image for each unlocked achievement
		for (const achievement of toUnlock) {
			try {
				const imageName = `achievement-${achievement.id}.png`;
				const nameText = resolveLangKey(achievement.nameKey);
				const descText = resolveLangKey(achievement.descKey);

				// Dispatch image render job
				const job = await queueManager.dispatch(
					'kythia-image-queue',
					'achievement',
					{
						type: 'achievementBanner',
						userId,
						options: {
							botToken: kythiaConfig.bot.token,
							achievementName: nameText,
							achievementDesc: descText,
							achievementEmoji: achievement.emoji,
							rarity: achievement.rarity,
							unlockedCount: newUnlockedCount,
							totalCount,
							customFont: 'BagelFatOne-Regular',
							fontWeight: 'normal',
							customWidth: 885,
							customHeight: 280,
						},
					},
				);

				const result = await queueManager.waitFor(job, 'kythia-image-queue');
				const buffer = Buffer.from(result.data);

				const { MessageFlags, ContainerBuilder, TextDisplayBuilder } =
					require('discord.js');

				const notifContainer = new ContainerBuilder()
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`🏆 <@${userId}> unlocked **${nameText}**!`,
						),
					)
					.addMediaGalleryComponents(
						new (require('discord.js').MediaGalleryBuilder)().addItems([
							new (require('discord.js').MediaGalleryItemBuilder)().setURL(
								`attachment://${imageName}`,
							),
						]),
					);

				await channel
					.send({
						components: [notifContainer],
						files: [{ attachment: buffer, name: imageName }],
						flags: MessageFlags.IsComponentsV2,
					})
					.catch(() => null);
			} catch (err) {
				logger.error(
					`Failed to render achievement banner for ${achievement.id}: ${err.message}`,
					{ label: 'activity:achievement' },
				);
			}
		}
	} catch (err) {
		logger.error(
			`Achievement check failed for ${userId} in ${guildId}: ${err.message}`,
			{ label: 'activity:achievementChecker' },
		);
	}
}

module.exports = { checkAndUnlock, ALL_ACHIEVEMENTS };
