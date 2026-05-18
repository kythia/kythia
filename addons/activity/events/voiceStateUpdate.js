/**
 * @namespace: addons/activity/events/voiceStateUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
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
	const { ActivityStat, ActivityLog } = models;
	const today = new Date().toISOString().slice(0, 10);

	try {
		// All-time counter
		let stat = await ActivityStat.getCache({ guildId, userId });

		if (!stat) {
			stat = await ActivityStat.create({
				guildId,
				userId,
				totalMessages: 0,
				totalVoiceTime: durationSeconds,
			});
		} else {
			stat.totalVoiceTime =
				BigInt(stat.totalVoiceTime) + BigInt(durationSeconds);
			stat.changed('totalVoiceTime', true);
			await stat.save();
		}

		// Daily bucket
		const [log] = await ActivityLog.findOrCreate({
			where: { guildId, userId, date: today },
			defaults: { messages: 0, voiceTime: 0 },
		});
		await log.increment({ voiceTime: durationSeconds });
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
	if (!member || member.user.bot) return;

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
