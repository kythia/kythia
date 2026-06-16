/**
 * @namespace: addons/activity/helpers/achievementUi.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

/** Emoji for each rarity tier */
const RARITY_EMOJI = {
	common: '⚪',
	rare: '🔵',
	epic: '🟣',
	legendary: '🟡',
};

/** Human-readable category labels */
const CATEGORY_LABELS = {
	messages: '💬 Messages (All-Time)',
	messages_daily: '📅 Messages (Daily Record)',
	messages_weekly: '📆 Messages (Weekly Record)',
	voice: '🎙️ Voice Chat (Hours)',
	voice_joins: '🔔 Voice Chat (Joins)',
	reactions: '😄 Reactions',
	server_age: '📅 Server Membership',
	collector: '🏅 Achievement Collector',
	special: '⭐ Special',
};

module.exports = {
	RARITY_EMOJI,
	CATEGORY_LABELS,
};
