/**
 * @namespace: addons/activity/events/voiceStateUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

/**
 * Tracks active voice sessions for activity stats.
 * Key: `${guildId}-${userId}`
 * Value: { joinedAt: number, intervalId: NodeJS.Timeout }
 */
const voiceSessions = new Map();

/** How often (ms) to auto-flush voice time for users still in a channel. */
const VOICE_FLUSH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

const { BaseEvent } = require('kythia-core');

const { checkAndUnlock } = require('../helpers/achievementChecker');

/**
 * Flush accumulated voice time (in seconds) to the DB.
 */
const flushVoiceTime = async (container, guildId, userId, durationSeconds) => {
	if (durationSeconds <= 0) return;

	const { models, logger } = container;
	const { ActivityStat, ActivityLog, ActivityHourly } = models;
	const now = new Date();
	const today = now.toISOString().slice(0, 10);
	const dayOfWeek = now.getDay();
	const hour = now.getHours();

	try {
		const [stat, statCreated] = await ActivityStat.firstOrCreateCache(
			{ guildId, userId },
			{
				totalMessages: '0',
				totalVoiceTime: durationSeconds.toString(),
				totalReactions: '0',
				totalVoiceJoins: '0',
			},
		);

		if (!statCreated) {
			stat.totalVoiceTime = (
				BigInt(stat.totalVoiceTime) + BigInt(durationSeconds)
			).toString();
			stat.changed('totalVoiceTime', true);
			await stat.save();
		}

		const [log, logCreated] = await ActivityLog.firstOrCreateCache(
			{ guildId, userId, date: today },
			{ messages: '0', voiceTime: durationSeconds.toString(), reactions: '0' },
		);

		if (!logCreated) {
			log.voiceTime = (
				BigInt(log.voiceTime) + BigInt(durationSeconds)
			).toString();
			log.changed('voiceTime', true);
			await log.save();
		}

		const [hourlyLog, hourlyCreated] = await ActivityHourly.firstOrCreateCache(
			{ guildId, dayOfWeek, hour },
			{ messages: '0', voiceTime: durationSeconds.toString() },
		);

		if (!hourlyCreated) {
			hourlyLog.voiceTime = (
				BigInt(hourlyLog.voiceTime) + BigInt(durationSeconds)
			).toString();
			hourlyLog.changed('voiceTime', true);
			await hourlyLog.save();
		}

		const guild = await container.helpers.discord.getGuildSafe(
			container.client,
			guildId,
		);
		if (guild) {
			checkAndUnlock('voice_flush', {
				guildId,
				userId,
				guild,
				container,
			}).catch(() => null);
		}
	} catch (err) {
		logger.error(
			`Failed to flush voice time for ${userId} in ${guildId}: ${err.message}`,
			{ label: 'activity:voiceStateUpdate' },
		);
	}
};

/**
 * Start a tracked voice session for a user, including a periodic auto-flush.
 */
const startSession = (container, guildId, userId, key, now) => {
	const intervalId = setInterval(() => {
		const session = voiceSessions.get(key);
		if (!session) return;

		const tick = Date.now();
		const elapsedSeconds = Math.floor((tick - session.joinedAt) / 1000);
		session.joinedAt = tick;

		flushVoiceTime(container, guildId, userId, elapsedSeconds);
	}, VOICE_FLUSH_INTERVAL_MS);

	voiceSessions.set(key, { joinedAt: now, intervalId });

	(async () => {
		try {
			const { models } = container;
			const { ActivityStat, ServerSetting } = models;
			const serverSetting = await ServerSetting.getCache({ guildId });
			if (!serverSetting?.activityOn) return;

			const [stat, statCreated] = await ActivityStat.firstOrCreateCache(
				{ guildId, userId },
				{
					totalMessages: '0',
					totalVoiceTime: '0',
					totalReactions: '0',
					totalVoiceJoins: '1',
				},
			);

			if (!statCreated) {
				stat.totalVoiceJoins = (BigInt(stat.totalVoiceJoins) + 1n).toString();
				stat.changed('totalVoiceJoins', true);
				await stat.save();
			}

			const specialFlags = [];

			if (statCreated || BigInt(stat.totalVoiceJoins) === 1n) {
				specialFlags.push('first_voice_join');
			}

			const guild = await container.helpers.discord.getGuildSafe(
				container.client,
				guildId,
			);
			if (guild) {
				const member = await container.helpers.discord.getMemberSafe(
					guild,
					userId,
				);
				const channelId = member?.voice?.channelId;
				if (channelId) {
					const channel = await container.helpers.discord.getChannelSafe(
						guild,
						channelId,
					);
					const humanCount =
						channel?.members?.filter((m) => !m.user.bot).size ?? 0;
					if (humanCount <= 1) specialFlags.push('echo_chamber');
				}

				checkAndUnlock('voice_join', {
					guildId,
					userId,
					guild,
					container,
					specialFlags,
				}).catch(() => null);
			}
		} catch {
			// Non-critical — silent fail
		}
	})();
};

/**
 * Clear the periodic flush interval and remove the session from the map.
 */
const endSession = (key) => {
	const session = voiceSessions.get(key);
	if (session) {
		clearInterval(session.intervalId);
		voiceSessions.delete(key);
	}
	return session;
};

class VoiceStateUpdateEvent extends BaseEvent {
	async execute(oldState, newState) {
		const container = this.container;
		const _bot = { client: this.client, container: this.container };

		const member = newState.member || oldState.member;
		if (!member?.user || member.user.bot) return;

		const guildId = (newState.guild || oldState.guild)?.id;
		if (!guildId) return;

		const { models } = container;
		const { ServerSetting } = models;

		const serverSetting = await ServerSetting.getCache({ guildId });
		if (!serverSetting?.activityOn) return;

		const userId = member.id;
		const key = `${guildId}-${userId}`;
		const now = Date.now();

		const isJoin = !oldState.channelId && newState.channelId;
		const isLeave = oldState.channelId && !newState.channelId;
		const isMove =
			oldState.channelId &&
			newState.channelId &&
			oldState.channelId !== newState.channelId;

		if (isJoin) {
			startSession(container, guildId, userId, key, now);
			return;
		}

		if (isLeave || isMove) {
			const session = endSession(key);

			if (session) {
				const elapsedSeconds = Math.floor((now - session.joinedAt) / 1000);
				flushVoiceTime(container, guildId, userId, elapsedSeconds);
			}

			if (isMove) {
				startSession(container, guildId, userId, key, now);
			}
		}
	}
}

module.exports = VoiceStateUpdateEvent;
