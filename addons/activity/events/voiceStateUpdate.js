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
 * Value: { joinedAt: number, intervalId: NodeJS.Timeout } — timestamp (ms)
 *        when the current flush window started, plus the periodic flush timer.
 *
 * We flush to the DB both on state change (leave / move) AND every
 * VOICE_FLUSH_INTERVAL_MS so long sessions are never lost mid-session.
 */
const voiceSessions = new Map();

/** How often (ms) to auto-flush voice time for users still in a channel. */
const VOICE_FLUSH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Flush accumulated voice time (in seconds) to the DB.
 *
 * @param {import('kythia-core').Kythia} bot
 * @param {string} guildId
 * @param {string} userId
 * @param {number} durationSeconds
 */
const flushVoiceTime = async (bot, guildId, userId, durationSeconds) => {
	if (durationSeconds <= 0) return;

	const { models, logger } = bot.client.container;
	const { ActivityStat, ActivityLog, ActivityHourly } = models;
	const now = new Date();
	const today = now.toISOString().slice(0, 10);
	const dayOfWeek = now.getDay();
	const hour = now.getHours();

	try {
		// All-time counter
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

		// Daily bucket
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

		// Hourly bucket
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

		// Achievement check after voice flush
		const guild = bot.client.guilds.cache.get(guildId);
		if (guild) {
			const { checkAndUnlock } = require('../helpers/achievementChecker');
			checkAndUnlock('voice_flush', {
				guildId,
				userId,
				guild,
				container: bot.client.container,
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
 * Start a tracked voice session for a user, including a periodic auto-flush
 * that saves accumulated time every VOICE_FLUSH_INTERVAL_MS without waiting
 * for the user to leave.
 *
 * @param {import('kythia-core').Kythia} bot
 * @param {string} guildId
 * @param {string} userId
 * @param {string} key  — Map key (`${guildId}-${userId}`)
 * @param {number} now  — Current timestamp in ms
 */
const startSession = (bot, guildId, userId, key, now) => {
	const intervalId = setInterval(() => {
		const session = voiceSessions.get(key);
		if (!session) return;

		const tick = Date.now();
		const elapsedSeconds = Math.floor((tick - session.joinedAt) / 1000);

		// Reset the window so the next tick only counts NEW time
		session.joinedAt = tick;

		// Fire-and-forget periodic flush
		flushVoiceTime(bot, guildId, userId, elapsedSeconds);
	}, VOICE_FLUSH_INTERVAL_MS);

	voiceSessions.set(key, { joinedAt: now, intervalId });

	// Increment voice join counter + fire achievement check async
	(async () => {
		try {
			const { models } = bot.client.container;
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

			// First voice join
			if (statCreated || BigInt(stat.totalVoiceJoins) === 1n) {
				specialFlags.push('first_voice_join');
			}

			// Echo chamber: joined a voice channel where nobody else is present
			const guild = bot.client.guilds.cache.get(guildId);
			if (guild) {
				const member = guild.members.cache.get(userId);
				const channelId = member?.voice?.channelId;
				if (channelId) {
					const channel = guild.channels.cache.get(channelId);
					const humanCount =
						channel?.members?.filter((m) => !m.user.bot).size ?? 0;
					if (humanCount <= 1) specialFlags.push('echo_chamber');
				}

				const { checkAndUnlock } = require('../helpers/achievementChecker');
				checkAndUnlock('voice_join', {
					guildId,
					userId,
					guild,
					container: bot.client.container,
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
 * Returns the session so the caller can flush remaining elapsed time.
 *
 * @param {string} key
 * @returns {{ joinedAt: number, intervalId: NodeJS.Timeout } | undefined}
 */
const endSession = (key) => {
	const session = voiceSessions.get(key);
	if (session) {
		clearInterval(session.intervalId);
		voiceSessions.delete(key);
	}
	return session;
};

/**
 * @param {import('kythia-core').Kythia} bot
 * @param {import('discord.js').VoiceState} oldState
 * @param {import('discord.js').VoiceState} newState
 */
module.exports = async (bot, oldState, newState) => {
	const member = newState.member || oldState.member;
	if (!member?.user || member.user.bot) return;

	const guildId = (newState.guild || oldState.guild)?.id;
	if (!guildId) return;

	const { models } = bot.client.container;
	const { ServerSetting } = models;

	// Feature flag check
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
		// Start tracking: record join timestamp + set periodic auto-flush
		startSession(bot, guildId, userId, key, now);
		return;
	}

	// On leave or channel move: flush remaining time and (for a move) restart the session
	if (isLeave || isMove) {
		const session = endSession(key); // also clears the interval

		if (session) {
			const elapsedSeconds = Math.floor((now - session.joinedAt) / 1000);

			// Fire-and-forget flush (non-blocking for the event loop)
			flushVoiceTime(bot, guildId, userId, elapsedSeconds);
		}

		if (isMove) {
			// Continue tracking in the new channel
			startSession(bot, guildId, userId, key, now);
		}
	}
};
