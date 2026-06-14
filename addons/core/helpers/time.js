/**
 * @namespace: addons/core/helpers/time.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

/**
 * Parses a human-readable duration string into milliseconds.
 * Accepts English and Indonesian unit synonyms and short forms.
 * @param {string} duration - e.g., "2h 30m", "1 day 5 hours", "10menit".
 * @returns {number} Milliseconds represented by the input, or 0 on invalid input.
 */
function parseDuration(duration) {
	if (!duration || typeof duration !== 'string') return 0;
	const timeUnitRegex =
		/(\d+)\s*(detik|second|seconds|menit|min|mins|minute|minutes|jam|hour|hours|hari|day|days|pekan|minggu|week|weeks|s|m|h|j|d|w|p)\b/gi;
	let totalMilliseconds = 0;
	let match;

	match = timeUnitRegex.exec(duration);
	while (match !== null) {
		const value = parseInt(match[1], 10);
		const unit = match[2].toLowerCase();

		switch (unit) {
			case 's':
			case 'detik':
			case 'second':
			case 'seconds':
				totalMilliseconds += value * 1000;
				break;
			case 'm':
			case 'menit':
			case 'min':
			case 'mins':
			case 'minute':
			case 'minutes':
				totalMilliseconds += value * 60 * 1000;
				break;
			case 'h':
			case 'j':
			case 'jam':
			case 'hour':
			case 'hours':
				totalMilliseconds += value * 60 * 60 * 1000;
				break;
			case 'd':
			case 'hari':
			case 'day':
			case 'days':
				totalMilliseconds += value * 24 * 60 * 60 * 1000;
				break;
			case 'w':
			case 'p':
			case 'pekan':
			case 'minggu':
			case 'week':
			case 'weeks':
				totalMilliseconds += value * 7 * 24 * 60 * 60 * 1000;
				break;
			default:
		}
		match = timeUnitRegex.exec(duration);
	}

	return totalMilliseconds;
}

/**
 * Checks cooldown based on the last execution time and cooldown length.
 * @param {number} lastTime - Timestamp in ms when the action last ran.
 * @param {number} cooldownInSeconds - Cooldown length in seconds.
 * @param {object} [interaction] - Discord interaction object with .user
 * @returns {{remaining:boolean,time?:string}} Remaining flag and friendly remaining time if active.
 */
function checkCooldown(lastTime, cooldownInSeconds, _interaction) {
	const now = Date.now();
	if (lastTime && now - lastTime < cooldownInSeconds * 1000) {
		const timeLeftInSeconds =
			cooldownInSeconds - Math.floor((now - lastTime) / 1000);
		const hours = Math.floor(timeLeftInSeconds / 3600);
		const minutes = Math.floor((timeLeftInSeconds % 3600) / 60);
		const seconds = timeLeftInSeconds % 60;
		return { remaining: true, time: `${hours}h ${minutes}m ${seconds}s` };
	}
	return { remaining: false };
}

/**
 * Formats a duration in milliseconds into a localized string using translator `t`.
 * @param {number} ms - Milliseconds to format.
 * @param {import('discord.js').Interaction} interaction - Context for localization.
 * @returns {Promise<string>} Localized human-readable duration.
 */
async function formatDuration(ms, interaction) {
	const { t } = interaction.client.container;
	if (ms < 1000) return `less than a second`;
	const seconds = Math.floor((ms / 1000) % 60);
	const minutes = Math.floor((ms / (1000 * 60)) % 60);
	const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
	const days = Math.floor(ms / (1000 * 60 * 60 * 24));

	const parts = [];
	if (days > 0)
		parts.push(`${days} ${await t(interaction, 'common.time.days')}`);
	if (hours > 0)
		parts.push(`${hours} ${await t(interaction, 'common.time.hours')}`);
	if (minutes > 0)
		parts.push(`${minutes} ${await t(interaction, 'common.time.minutes')}`);
	if (seconds > 0)
		parts.push(`${seconds} ${await t(interaction, 'common.time.seconds')}`);

	return parts.join(', ');
}

const TIMEZONES = {
	// UTC MINUS
	'Pacific/Midway': 'UTC-11 — Pacific/Midway',
	'Pacific/Honolulu': 'UTC-10 — Pacific/Honolulu',
	'America/Anchorage': 'UTC-9 — America/Anchorage',
	'America/Los_Angeles': 'UTC-8 — America/Los_Angeles (PT)',
	'America/Denver': 'UTC-7 — America/Denver (MT)',
	'America/Chicago': 'UTC-6 — America/Chicago (CT)',
	'America/New_York': 'UTC-5 — America/New_York (ET)',
	'America/Halifax': 'UTC-4 — America/Halifax',
	'America/Sao_Paulo': 'UTC-3 — America/Sao_Paulo',
	'Atlantic/South_Georgia': 'UTC-2 — Atlantic/South_Georgia',
	'Atlantic/Cape_Verde': 'UTC-1 — Atlantic/Cape_Verde',

	// --- UTC Zero ---
	UTC: 'UTC+0 — Coordinated Universal Time',
	'Europe/London': 'UTC+0 — Europe/London (GMT)',

	// --- UTC Plus (Europe, Africa, Asia, Oceania) ---
	'Europe/Paris': 'UTC+1 — Europe/Paris (CET)',
	'Europe/Berlin': 'UTC+1 — Europe/Berlin (CET)',
	'Africa/Cairo': 'UTC+2 — Africa/Cairo',
	'Europe/Moscow': 'UTC+3 — Europe/Moscow',
	'Asia/Dubai': 'UTC+4 — Asia/Dubai',
	'Asia/Karachi': 'UTC+5 — Asia/Karachi',
	'Asia/Kolkata': 'UTC+5:30 — Asia/Kolkata',
	'Asia/Kathmandu': 'UTC+5:45 — Asia/Kathmandu',
	'Asia/Dhaka': 'UTC+6 — Asia/Dhaka',
	'Asia/Jakarta': 'UTC+7 — Asia/Jakarta (WIB)',
	'Asia/Bangkok': 'UTC+7 — Asia/Bangkok',
	'Asia/Makassar': 'UTC+8 — Asia/Makassar (WITA)',
	'Asia/Singapore': 'UTC+8 — Asia/Singapore',
	'Asia/Kuala_Lumpur': 'UTC+8 — Asia/Kuala_Lumpur',
	'Asia/Manila': 'UTC+8 — Asia/Manila',
	'Asia/Jayapura': 'UTC+9 — Asia/Jayapura (WIT)',
	'Asia/Tokyo': 'UTC+9 — Asia/Tokyo',
	'Asia/Seoul': 'UTC+9 — Asia/Seoul',
	'Australia/Adelaide': 'UTC+9:30 — Australia/Adelaide',
	'Australia/Sydney': 'UTC+10 — Australia/Sydney',
	'Pacific/Noumea': 'UTC+11 — Pacific/Noumea',
	'Pacific/Auckland': 'UTC+12 — Pacific/Auckland',
};

module.exports = { parseDuration, checkCooldown, formatDuration, TIMEZONES };
