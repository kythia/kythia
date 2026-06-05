/**
 * @namespace: addons/activity/helpers/achievements.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 *
 * Achievement definitions for the activity addon.
 * Each entry has:
 *   - id         Unique string key (used in DB)
 *   - nameKey    i18n key for the display name
 *   - descKey    i18n key for the description
 *   - emoji      Decorative emoji
 *   - rarity     'common' | 'rare' | 'epic' | 'legendary'
 *   - condition  { type, value } — evaluated by achievementChecker.js
 *
 * Condition types:
 *   messages_total    — ActivityStat.totalMessages >= value
 *   messages_daily    — ActivityLog SUM(messages) for today >= value
 *   messages_weekly   — ActivityLog SUM(messages) for last 7 days >= value
 *   voice_hours       — ActivityStat.totalVoiceTime (seconds) >= value * 3600
 *   voice_joins       — ActivityStat.totalVoiceJoins >= value
 *   reactions_total   — ActivityStat.totalReactions >= value
 *   achievements_count — UserAchievement count for user/guild >= value
 *   server_age_days   — member.joinedAt age in days >= value
 *   special           — hardcoded flag checked inline (no DB query needed)
 */

module.exports = {
	// ─────────────────────────────────────────────────────────────────
	// MESSAGES — total all-time
	// ─────────────────────────────────────────────────────────────────
	messages: [
		{
			id: 'messages_250',
			nameKey: 'activity.achievement.messages_250.name',
			descKey: 'activity.achievement.messages_250.desc',
			emoji: '💬',
			rarity: 'common',
			condition: { type: 'messages_total', value: 250 },
		},
		{
			id: 'messages_500',
			nameKey: 'activity.achievement.messages_500.name',
			descKey: 'activity.achievement.messages_500.desc',
			emoji: '💬',
			rarity: 'common',
			condition: { type: 'messages_total', value: 500 },
		},
		{
			id: 'messages_1000',
			nameKey: 'activity.achievement.messages_1000.name',
			descKey: 'activity.achievement.messages_1000.desc',
			emoji: '💬',
			rarity: 'common',
			condition: { type: 'messages_total', value: 1000 },
		},
		{
			id: 'messages_2500',
			nameKey: 'activity.achievement.messages_2500.name',
			descKey: 'activity.achievement.messages_2500.desc',
			emoji: '💬',
			rarity: 'rare',
			condition: { type: 'messages_total', value: 2500 },
		},
		{
			id: 'messages_5000',
			nameKey: 'activity.achievement.messages_5000.name',
			descKey: 'activity.achievement.messages_5000.desc',
			emoji: '💬',
			rarity: 'rare',
			condition: { type: 'messages_total', value: 5000 },
		},
		{
			id: 'messages_10000',
			nameKey: 'activity.achievement.messages_10000.name',
			descKey: 'activity.achievement.messages_10000.desc',
			emoji: '💬',
			rarity: 'rare',
			condition: { type: 'messages_total', value: 10000 },
		},
		{
			id: 'messages_25000',
			nameKey: 'activity.achievement.messages_25000.name',
			descKey: 'activity.achievement.messages_25000.desc',
			emoji: '🗨️',
			rarity: 'epic',
			condition: { type: 'messages_total', value: 25000 },
		},
		{
			id: 'messages_50000',
			nameKey: 'activity.achievement.messages_50000.name',
			descKey: 'activity.achievement.messages_50000.desc',
			emoji: '🗨️',
			rarity: 'epic',
			condition: { type: 'messages_total', value: 50000 },
		},
		{
			id: 'messages_100000',
			nameKey: 'activity.achievement.messages_100000.name',
			descKey: 'activity.achievement.messages_100000.desc',
			emoji: '📣',
			rarity: 'legendary',
			condition: { type: 'messages_total', value: 100000 },
		},
		{
			id: 'messages_250000',
			nameKey: 'activity.achievement.messages_250000.name',
			descKey: 'activity.achievement.messages_250000.desc',
			emoji: '📣',
			rarity: 'legendary',
			condition: { type: 'messages_total', value: 250000 },
		},
	],

	// ─────────────────────────────────────────────────────────────────
	// MESSAGES — daily
	// ─────────────────────────────────────────────────────────────────
	messages_daily: [
		{
			id: 'messages_daily_100',
			nameKey: 'activity.achievement.messages_daily_100.name',
			descKey: 'activity.achievement.messages_daily_100.desc',
			emoji: '📅',
			rarity: 'common',
			condition: { type: 'messages_daily', value: 100 },
		},
		{
			id: 'messages_daily_250',
			nameKey: 'activity.achievement.messages_daily_250.name',
			descKey: 'activity.achievement.messages_daily_250.desc',
			emoji: '📅',
			rarity: 'common',
			condition: { type: 'messages_daily', value: 250 },
		},
		{
			id: 'messages_daily_500',
			nameKey: 'activity.achievement.messages_daily_500.name',
			descKey: 'activity.achievement.messages_daily_500.desc',
			emoji: '📅',
			rarity: 'rare',
			condition: { type: 'messages_daily', value: 500 },
		},
		{
			id: 'messages_daily_1000',
			nameKey: 'activity.achievement.messages_daily_1000.name',
			descKey: 'activity.achievement.messages_daily_1000.desc',
			emoji: '📅',
			rarity: 'rare',
			condition: { type: 'messages_daily', value: 1000 },
		},
		{
			id: 'messages_daily_2500',
			nameKey: 'activity.achievement.messages_daily_2500.name',
			descKey: 'activity.achievement.messages_daily_2500.desc',
			emoji: '🔥',
			rarity: 'epic',
			condition: { type: 'messages_daily', value: 2500 },
		},
		{
			id: 'messages_daily_5000',
			nameKey: 'activity.achievement.messages_daily_5000.name',
			descKey: 'activity.achievement.messages_daily_5000.desc',
			emoji: '🔥',
			rarity: 'epic',
			condition: { type: 'messages_daily', value: 5000 },
		},
		{
			id: 'messages_daily_10000',
			nameKey: 'activity.achievement.messages_daily_10000.name',
			descKey: 'activity.achievement.messages_daily_10000.desc',
			emoji: '⚡',
			rarity: 'legendary',
			condition: { type: 'messages_daily', value: 10000 },
		},
	],

	// ─────────────────────────────────────────────────────────────────
	// MESSAGES — weekly
	// ─────────────────────────────────────────────────────────────────
	messages_weekly: [
		{
			id: 'messages_weekly_100',
			nameKey: 'activity.achievement.messages_weekly_100.name',
			descKey: 'activity.achievement.messages_weekly_100.desc',
			emoji: '📆',
			rarity: 'common',
			condition: { type: 'messages_weekly', value: 100 },
		},
		{
			id: 'messages_weekly_500',
			nameKey: 'activity.achievement.messages_weekly_500.name',
			descKey: 'activity.achievement.messages_weekly_500.desc',
			emoji: '📆',
			rarity: 'common',
			condition: { type: 'messages_weekly', value: 500 },
		},
		{
			id: 'messages_weekly_1000',
			nameKey: 'activity.achievement.messages_weekly_1000.name',
			descKey: 'activity.achievement.messages_weekly_1000.desc',
			emoji: '📆',
			rarity: 'rare',
			condition: { type: 'messages_weekly', value: 1000 },
		},
		{
			id: 'messages_weekly_2500',
			nameKey: 'activity.achievement.messages_weekly_2500.name',
			descKey: 'activity.achievement.messages_weekly_2500.desc',
			emoji: '📆',
			rarity: 'rare',
			condition: { type: 'messages_weekly', value: 2500 },
		},
		{
			id: 'messages_weekly_5000',
			nameKey: 'activity.achievement.messages_weekly_5000.name',
			descKey: 'activity.achievement.messages_weekly_5000.desc',
			emoji: '🌟',
			rarity: 'epic',
			condition: { type: 'messages_weekly', value: 5000 },
		},
		{
			id: 'messages_weekly_10000',
			nameKey: 'activity.achievement.messages_weekly_10000.name',
			descKey: 'activity.achievement.messages_weekly_10000.desc',
			emoji: '🌟',
			rarity: 'epic',
			condition: { type: 'messages_weekly', value: 10000 },
		},
		{
			id: 'messages_weekly_15000',
			nameKey: 'activity.achievement.messages_weekly_15000.name',
			descKey: 'activity.achievement.messages_weekly_15000.desc',
			emoji: '💫',
			rarity: 'legendary',
			condition: { type: 'messages_weekly', value: 15000 },
		},
	],

	// ─────────────────────────────────────────────────────────────────
	// VOICE — total hours
	// ─────────────────────────────────────────────────────────────────
	voice: [
		{
			id: 'voice_5h',
			nameKey: 'activity.achievement.voice_5h.name',
			descKey: 'activity.achievement.voice_5h.desc',
			emoji: '🎙️',
			rarity: 'common',
			condition: { type: 'voice_hours', value: 5 },
		},
		{
			id: 'voice_10h',
			nameKey: 'activity.achievement.voice_10h.name',
			descKey: 'activity.achievement.voice_10h.desc',
			emoji: '🎙️',
			rarity: 'common',
			condition: { type: 'voice_hours', value: 10 },
		},
		{
			id: 'voice_24h',
			nameKey: 'activity.achievement.voice_24h.name',
			descKey: 'activity.achievement.voice_24h.desc',
			emoji: '🎙️',
			rarity: 'common',
			condition: { type: 'voice_hours', value: 24 },
		},
		{
			id: 'voice_48h',
			nameKey: 'activity.achievement.voice_48h.name',
			descKey: 'activity.achievement.voice_48h.desc',
			emoji: '🎤',
			rarity: 'rare',
			condition: { type: 'voice_hours', value: 48 },
		},
		{
			id: 'voice_72h',
			nameKey: 'activity.achievement.voice_72h.name',
			descKey: 'activity.achievement.voice_72h.desc',
			emoji: '🎤',
			rarity: 'rare',
			condition: { type: 'voice_hours', value: 72 },
		},
		{
			id: 'voice_100h',
			nameKey: 'activity.achievement.voice_100h.name',
			descKey: 'activity.achievement.voice_100h.desc',
			emoji: '🎤',
			rarity: 'rare',
			condition: { type: 'voice_hours', value: 100 },
		},
		{
			id: 'voice_250h',
			nameKey: 'activity.achievement.voice_250h.name',
			descKey: 'activity.achievement.voice_250h.desc',
			emoji: '🔊',
			rarity: 'epic',
			condition: { type: 'voice_hours', value: 250 },
		},
		{
			id: 'voice_500h',
			nameKey: 'activity.achievement.voice_500h.name',
			descKey: 'activity.achievement.voice_500h.desc',
			emoji: '🔊',
			rarity: 'epic',
			condition: { type: 'voice_hours', value: 500 },
		},
		{
			id: 'voice_1000h',
			nameKey: 'activity.achievement.voice_1000h.name',
			descKey: 'activity.achievement.voice_1000h.desc',
			emoji: '📡',
			rarity: 'legendary',
			condition: { type: 'voice_hours', value: 1000 },
		},
		{
			id: 'voice_2500h',
			nameKey: 'activity.achievement.voice_2500h.name',
			descKey: 'activity.achievement.voice_2500h.desc',
			emoji: '📡',
			rarity: 'legendary',
			condition: { type: 'voice_hours', value: 2500 },
		},
	],

	// ─────────────────────────────────────────────────────────────────
	// VOICE — join count
	// ─────────────────────────────────────────────────────────────────
	voice_joins: [
		{
			id: 'voice_joins_5',
			nameKey: 'activity.achievement.voice_joins_5.name',
			descKey: 'activity.achievement.voice_joins_5.desc',
			emoji: '🔔',
			rarity: 'common',
			condition: { type: 'voice_joins', value: 5 },
		},
		{
			id: 'voice_joins_25',
			nameKey: 'activity.achievement.voice_joins_25.name',
			descKey: 'activity.achievement.voice_joins_25.desc',
			emoji: '🔔',
			rarity: 'common',
			condition: { type: 'voice_joins', value: 25 },
		},
		{
			id: 'voice_joins_100',
			nameKey: 'activity.achievement.voice_joins_100.name',
			descKey: 'activity.achievement.voice_joins_100.desc',
			emoji: '🔔',
			rarity: 'rare',
			condition: { type: 'voice_joins', value: 100 },
		},
		{
			id: 'voice_joins_250',
			nameKey: 'activity.achievement.voice_joins_250.name',
			descKey: 'activity.achievement.voice_joins_250.desc',
			emoji: '🔔',
			rarity: 'rare',
			condition: { type: 'voice_joins', value: 250 },
		},
		{
			id: 'voice_joins_500',
			nameKey: 'activity.achievement.voice_joins_500.name',
			descKey: 'activity.achievement.voice_joins_500.desc',
			emoji: '📢',
			rarity: 'epic',
			condition: { type: 'voice_joins', value: 500 },
		},
		{
			id: 'voice_joins_1000',
			nameKey: 'activity.achievement.voice_joins_1000.name',
			descKey: 'activity.achievement.voice_joins_1000.desc',
			emoji: '📢',
			rarity: 'epic',
			condition: { type: 'voice_joins', value: 1000 },
		},
		{
			id: 'voice_joins_5000',
			nameKey: 'activity.achievement.voice_joins_5000.name',
			descKey: 'activity.achievement.voice_joins_5000.desc',
			emoji: '🏆',
			rarity: 'legendary',
			condition: { type: 'voice_joins', value: 5000 },
		},
	],

	// ─────────────────────────────────────────────────────────────────
	// REACTIONS — total
	// ─────────────────────────────────────────────────────────────────
	reactions: [
		{
			id: 'reactions_25',
			nameKey: 'activity.achievement.reactions_25.name',
			descKey: 'activity.achievement.reactions_25.desc',
			emoji: '😄',
			rarity: 'common',
			condition: { type: 'reactions_total', value: 25 },
		},
		{
			id: 'reactions_100',
			nameKey: 'activity.achievement.reactions_100.name',
			descKey: 'activity.achievement.reactions_100.desc',
			emoji: '😄',
			rarity: 'common',
			condition: { type: 'reactions_total', value: 100 },
		},
		{
			id: 'reactions_500',
			nameKey: 'activity.achievement.reactions_500.name',
			descKey: 'activity.achievement.reactions_500.desc',
			emoji: '😄',
			rarity: 'rare',
			condition: { type: 'reactions_total', value: 500 },
		},
		{
			id: 'reactions_1000',
			nameKey: 'activity.achievement.reactions_1000.name',
			descKey: 'activity.achievement.reactions_1000.desc',
			emoji: '🎭',
			rarity: 'rare',
			condition: { type: 'reactions_total', value: 1000 },
		},
		{
			id: 'reactions_2500',
			nameKey: 'activity.achievement.reactions_2500.name',
			descKey: 'activity.achievement.reactions_2500.desc',
			emoji: '🎭',
			rarity: 'epic',
			condition: { type: 'reactions_total', value: 2500 },
		},
		{
			id: 'reactions_5000',
			nameKey: 'activity.achievement.reactions_5000.name',
			descKey: 'activity.achievement.reactions_5000.desc',
			emoji: '🎭',
			rarity: 'epic',
			condition: { type: 'reactions_total', value: 5000 },
		},
		{
			id: 'reactions_10000',
			nameKey: 'activity.achievement.reactions_10000.name',
			descKey: 'activity.achievement.reactions_10000.desc',
			emoji: '🏅',
			rarity: 'legendary',
			condition: { type: 'reactions_total', value: 10000 },
		},
	],

	// ─────────────────────────────────────────────────────────────────
	// SERVER AGE — membership duration
	// ─────────────────────────────────────────────────────────────────
	server_age: [
		{
			id: 'server_age_1w',
			nameKey: 'activity.achievement.server_age_1w.name',
			descKey: 'activity.achievement.server_age_1w.desc',
			emoji: '📅',
			rarity: 'common',
			condition: { type: 'server_age_days', value: 7 },
		},
		{
			id: 'server_age_1m',
			nameKey: 'activity.achievement.server_age_1m.name',
			descKey: 'activity.achievement.server_age_1m.desc',
			emoji: '📅',
			rarity: 'common',
			condition: { type: 'server_age_days', value: 30 },
		},
		{
			id: 'server_age_3m',
			nameKey: 'activity.achievement.server_age_3m.name',
			descKey: 'activity.achievement.server_age_3m.desc',
			emoji: '🗓️',
			rarity: 'rare',
			condition: { type: 'server_age_days', value: 90 },
		},
		{
			id: 'server_age_6m',
			nameKey: 'activity.achievement.server_age_6m.name',
			descKey: 'activity.achievement.server_age_6m.desc',
			emoji: '🗓️',
			rarity: 'rare',
			condition: { type: 'server_age_days', value: 180 },
		},
		{
			id: 'server_age_1y',
			nameKey: 'activity.achievement.server_age_1y.name',
			descKey: 'activity.achievement.server_age_1y.desc',
			emoji: '🎂',
			rarity: 'epic',
			condition: { type: 'server_age_days', value: 365 },
		},
		{
			id: 'server_age_2y',
			nameKey: 'activity.achievement.server_age_2y.name',
			descKey: 'activity.achievement.server_age_2y.desc',
			emoji: '🎂',
			rarity: 'epic',
			condition: { type: 'server_age_days', value: 730 },
		},
		{
			id: 'server_age_3y',
			nameKey: 'activity.achievement.server_age_3y.name',
			descKey: 'activity.achievement.server_age_3y.desc',
			emoji: '👑',
			rarity: 'legendary',
			condition: { type: 'server_age_days', value: 1095 },
		},
		{
			id: 'server_age_4y',
			nameKey: 'activity.achievement.server_age_4y.name',
			descKey: 'activity.achievement.server_age_4y.desc',
			emoji: '👑',
			rarity: 'legendary',
			condition: { type: 'server_age_days', value: 1460 },
		},
		{
			id: 'server_age_5y',
			nameKey: 'activity.achievement.server_age_5y.name',
			descKey: 'activity.achievement.server_age_5y.desc',
			emoji: '💎',
			rarity: 'legendary',
			condition: { type: 'server_age_days', value: 1825 },
		},
	],

	// ─────────────────────────────────────────────────────────────────
	// ACHIEVEMENT COLLECTOR — meta achievements
	// ─────────────────────────────────────────────────────────────────
	collector: [
		{
			id: 'collector_10',
			nameKey: 'activity.achievement.collector_10.name',
			descKey: 'activity.achievement.collector_10.desc',
			emoji: '🏅',
			rarity: 'common',
			condition: { type: 'achievements_count', value: 10 },
		},
		{
			id: 'collector_25',
			nameKey: 'activity.achievement.collector_25.name',
			descKey: 'activity.achievement.collector_25.desc',
			emoji: '🏅',
			rarity: 'common',
			condition: { type: 'achievements_count', value: 25 },
		},
		{
			id: 'collector_50',
			nameKey: 'activity.achievement.collector_50.name',
			descKey: 'activity.achievement.collector_50.desc',
			emoji: '🥇',
			rarity: 'rare',
			condition: { type: 'achievements_count', value: 50 },
		},
		{
			id: 'collector_100',
			nameKey: 'activity.achievement.collector_100.name',
			descKey: 'activity.achievement.collector_100.desc',
			emoji: '🥇',
			rarity: 'epic',
			condition: { type: 'achievements_count', value: 100 },
		},
	],

	// ─────────────────────────────────────────────────────────────────
	// SPECIAL — one-off / fun achievements
	// Checked inline in event handlers via the 'special' flag.
	// ─────────────────────────────────────────────────────────────────
	special: [
		{
			id: 'first_message',
			nameKey: 'activity.achievement.first_message.name',
			descKey: 'activity.achievement.first_message.desc',
			emoji: '✉️',
			rarity: 'common',
			condition: { type: 'special', flag: 'first_message' },
		},
		{
			id: 'first_voice_join',
			nameKey: 'activity.achievement.first_voice_join.name',
			descKey: 'activity.achievement.first_voice_join.desc',
			emoji: '🎙️',
			rarity: 'common',
			condition: { type: 'special', flag: 'first_voice_join' },
		},
		{
			id: 'night_owl',
			nameKey: 'activity.achievement.night_owl.name',
			descKey: 'activity.achievement.night_owl.desc',
			emoji: '🦉',
			rarity: 'rare',
			condition: { type: 'special', flag: 'night_owl' },
		},
		{
			id: 'wall_of_text',
			nameKey: 'activity.achievement.wall_of_text.name',
			descKey: 'activity.achievement.wall_of_text.desc',
			emoji: '📜',
			rarity: 'common',
			condition: { type: 'special', flag: 'wall_of_text' },
		},
		{
			id: 'precision_typer',
			nameKey: 'activity.achievement.precision_typer.name',
			descKey: 'activity.achievement.precision_typer.desc',
			emoji: '🎯',
			rarity: 'rare',
			condition: { type: 'special', flag: 'precision_typer' },
		},
		{
			id: 'talking_to_myself',
			nameKey: 'activity.achievement.talking_to_myself.name',
			descKey: 'activity.achievement.talking_to_myself.desc',
			emoji: '🗣️',
			rarity: 'common',
			condition: { type: 'special', flag: 'talking_to_myself' },
		},
		{
			id: 'echo_chamber',
			nameKey: 'activity.achievement.echo_chamber.name',
			descKey: 'activity.achievement.echo_chamber.desc',
			emoji: '🪣',
			rarity: 'common',
			condition: { type: 'special', flag: 'echo_chamber' },
		},
		{
			id: 'server_booster',
			nameKey: 'activity.achievement.server_booster.name',
			descKey: 'activity.achievement.server_booster.desc',
			emoji: '🚀',
			rarity: 'epic',
			condition: { type: 'special', flag: 'server_booster' },
		},
	],
};
