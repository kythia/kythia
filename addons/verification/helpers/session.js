/**
 * @namespace: addons/verification/helpers/session.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

/** @type {Map<string, object>} */
const sessions = new Map();

/**
 * Create (or overwrite) a verification session.
 */
function createSession({
	guildId,
	userId,
	answer,
	channelId,
	messageId,
	timeoutMs,
	onTimeout,
}) {
	const key = `${guildId}_${userId}`;

	// Clear any existing timer
	const existing = sessions.get(key);
	if (existing?.timer) clearTimeout(existing.timer);

	const timer =
		timeoutMs > 0
			? setTimeout(async () => {
					sessions.delete(key);
					if (typeof onTimeout === 'function') await onTimeout();
				}, timeoutMs)
			: null;

	sessions.set(key, {
		answer,
		attempts: 0,
		timer,
		channelId,
		messageId,
		guildId,
		userId,
	});
}

/**
 * Get an active session.
 */
function getSession(guildId, userId) {
	return sessions.get(`${guildId}_${userId}`) || null;
}

/**
 * Get a session by channel and user (useful for DMs).
 */
function getSessionByChannel(channelId, userId) {
	for (const session of sessions.values()) {
		if (session.channelId === channelId && session.userId === userId) {
			return session;
		}
	}
	return null;
}

/**
 * Increment attempt count. Returns new count.
 */
function incrementAttempts(guildId, userId) {
	const s = sessions.get(`${guildId}_${userId}`);
	if (!s) return 0;
	s.attempts += 1;
	return s.attempts;
}

/**
 * Remove a session cleanly (cancel timer).
 */
function clearSession(guildId, userId) {
	const key = `${guildId}_${userId}`;
	const s = sessions.get(key);
	if (s?.timer) clearTimeout(s.timer);
	sessions.delete(key);
}

/**
 * Check if a session exists.
 */
function hasSession(guildId, userId) {
	return sessions.has(`${guildId}_${userId}`);
}

module.exports = {
	createSession,
	getSession,
	getSessionByChannel,
	incrementAttempts,
	clearSession,
	hasSession,
	sessions,
};
