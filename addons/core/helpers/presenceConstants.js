const { ActivityType, PresenceUpdateStatus } = require('discord.js');

const STATUS_OPTIONS = Object.entries(PresenceUpdateStatus)
	.filter(([_k, v]) => typeof v === 'string')
	.map(([k]) => ({ name: k, value: k }));

const ACTIVITY_TYPE_OPTIONS = Object.entries(ActivityType)
	.filter(([_k, v]) => typeof v === 'number')
	.map(([k]) => ({ name: k, value: k }));

module.exports = {
	STATUS_OPTIONS,
	ACTIVITY_TYPE_OPTIONS,
};
