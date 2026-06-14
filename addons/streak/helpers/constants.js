const MIN_QUOTA = 0; // 0 = disable restores entirely
const MAX_QUOTA = 30;

const COMMON_TIMEZONES = [
	{ name: 'UTC+0 — UTC', value: 'UTC' },
	{ name: 'UTC+7 — Asia/Jakarta (WIB)', value: 'Asia/Jakarta' },
	{ name: 'UTC+8 — Asia/Singapore', value: 'Asia/Singapore' },
	{ name: 'UTC+8 — Asia/Kuala_Lumpur', value: 'Asia/Kuala_Lumpur' },
	{ name: 'UTC+8 — Asia/Manila', value: 'Asia/Manila' },
	{ name: 'UTC+8 — Asia/Makassar (WITA)', value: 'Asia/Makassar' },
	{ name: 'UTC+9 — Asia/Tokyo', value: 'Asia/Tokyo' },
	{ name: 'UTC+9 — Asia/Seoul', value: 'Asia/Seoul' },
	{ name: 'UTC+9 — Asia/Jayapura (WIT)', value: 'Asia/Jayapura' },
	{ name: 'UTC+5:30 — Asia/Kolkata', value: 'Asia/Kolkata' },
	{ name: 'UTC+5 — Asia/Karachi', value: 'Asia/Karachi' },
	{ name: 'UTC+3 — Europe/Moscow', value: 'Europe/Moscow' },
	{ name: 'UTC+1 — Europe/Paris', value: 'Europe/Paris' },
	{ name: 'UTC+1 — Europe/Berlin', value: 'Europe/Berlin' },
	{ name: 'UTC+0 — Europe/London', value: 'Europe/London' },
	{ name: 'UTC-5 — America/New_York', value: 'America/New_York' },
	{ name: 'UTC-6 — America/Chicago', value: 'America/Chicago' },
	{ name: 'UTC-7 — America/Denver', value: 'America/Denver' },
	{ name: 'UTC-8 — America/Los_Angeles', value: 'America/Los_Angeles' },
	{ name: 'UTC+10 — Australia/Sydney', value: 'Australia/Sydney' },
	{ name: 'UTC+12 — Pacific/Auckland', value: 'Pacific/Auckland' },
	{ name: 'UTC-3 — America/Sao_Paulo', value: 'America/Sao_Paulo' },
	{ name: 'UTC+2 — Africa/Cairo', value: 'Africa/Cairo' },
	{ name: 'UTC+4 — Asia/Dubai', value: 'Asia/Dubai' },
	{ name: 'UTC+5:45 — Asia/Kathmandu', value: 'Asia/Kathmandu' },
];

module.exports = {
	MIN_QUOTA,
	MAX_QUOTA,
	COMMON_TIMEZONES,
};
