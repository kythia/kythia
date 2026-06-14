/**
 * @namespace: addons/reminder/helpers/time.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

/**
 * Parses a time string into a future Date object.
 * Supports relative time ("10m", "2h", "1d") and absolute time ("12:00", "15:30", "8:00 AM", "8pm").
 * Absolute times are resolved in the given timezone.
 */
function parseTime(timeStr, timezone = 'UTC') {
	timeStr = timeStr.trim();

	// Check relative time first
	const relRegex = /^(\d+)([smhd])$/i;
	const relMatch = timeStr.match(relRegex);
	if (relMatch) {
		const value = parseInt(relMatch[1], 10);
		const unit = relMatch[2].toLowerCase();
		let ms = 0;
		switch (unit) {
			case 's':
				ms = value * 1000;
				break;
			case 'm':
				ms = value * 60 * 1000;
				break;
			case 'h':
				ms = value * 60 * 60 * 1000;
				break;
			case 'd':
				ms = value * 24 * 60 * 60 * 1000;
				break;
		}
		const targetDate = new Date(Date.now() + ms);
		targetDate.setSeconds(0, 0);
		return targetDate;
	}

	// Check absolute time
	// Formats: "12:00", "15:30", "8:15 AM", "8pm"
	const absRegex = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i;
	const absMatch = timeStr.match(absRegex);
	if (absMatch) {
		let hours = parseInt(absMatch[1], 10);
		const minutes = parseInt(absMatch[2] || '0', 10);
		const meridiem = absMatch[3] ? absMatch[3].toLowerCase() : null;

		if (hours > 23 || minutes > 59) return null;

		if (meridiem === 'pm' && hours < 12) hours += 12;
		if (meridiem === 'am' && hours === 12) hours = 0;

		// We need to resolve this time in the user's timezone.
		// Native JS Dates are pain, but we can construct an ISO string and parse it.
		// A reliable way in native JS:
		const now = new Date();
		// Get current year, month, day in user's timezone
		const formatter = new Intl.DateTimeFormat('en-US', {
			timeZone: timezone,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour12: false,
		});

		const parts = formatter.formatToParts(now);
		const getPart = (type) => parts.find((p) => p.type === type).value;

		const year = getPart('year');
		const month = getPart('month');
		const day = getPart('day');

		// Create ISO string for the target time in that timezone
		// Form: YYYY-MM-DDTHH:mm:00.000 (We can't just append 'Z' or offset directly without knowing it)
		// Better approach: build a string that JS can parse as local time in that timezone?
		// No, `new Date('YYYY-MM-DD HH:mm:ss GMT+...')`

		// To safely calculate offset:
		// Convert `now` to target timezone string, calculate offset difference, then apply to UTC.

		// Trick: use `toLocaleString('en-US', { timeZone })` to see what time it is there,
		// but we want to go from local timezone string to UTC Date.

		// Wait, a known trick is to construct a Date in UTC, and shift it.
		// Let's just use `Date.parse()` with the timezone offset.
		// To get offset for a specific date in a specific timezone:

		// Try to find the offset by formatting a known UTC time
		const tempDate = new Date(`${year}-${month}-${day}T12:00:00Z`);
		const tempParts = new Intl.DateTimeFormat('en-US', {
			timeZone: timezone,
			timeZoneName: 'shortOffset',
			hour12: false,
		}).formatToParts(tempDate);
		const offsetPart = tempParts.find((p) => p.type === 'timeZoneName').value; // e.g. "GMT+7" or "GMT-05:00"

		let offsetStr = offsetPart.replace('GMT', '');
		if (!offsetStr) {
			offsetStr = '+00:00';
		} else {
			const match = offsetStr.match(/^([+-])(\d{1,2})(?::(\d{2}))?$/);
			if (match) {
				const sign = match[1];
				const hr = match[2].padStart(2, '0');
				const min = match[3] || '00';
				offsetStr = `${sign}${hr}:${min}`;
			}
		}

		const isoString = `${year}-${month}-${day}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00${offsetStr}`;
		const targetDate = new Date(isoString);

		if (Number.isNaN(targetDate.getTime())) return null;

		// If the target time is in the past, add 1 day
		if (targetDate <= now) {
			targetDate.setUTCDate(targetDate.getUTCDate() + 1);
		}

		return targetDate;
	}

	return null;
}

module.exports = { parseTime };
