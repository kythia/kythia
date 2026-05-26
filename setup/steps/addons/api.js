/**
 * @file setup/steps/addons/api.js
 * @description Per-addon config step for the Dashboard / API addon
 * @copyright © 2026 kenndeclouv
 */

/** biome-ignore-all lint/suspicious/noConsole: not the bot log, ignore console warn */

const crypto = require('node:crypto');
const { ask, confirm, hint } = require('../../prompt');

/**
 * @param {string} addonName
 * @returns {Promise<object>} config fields merged into the addon result
 */
module.exports = async (_addonName) => {
	const apiUrl = await ask(
		'Public API URL (e.g. http://localhost:3000)',
		'http://localhost:3000',
	);

	const apiPort = await ask('API port', '3000');

	const autoSecret = crypto.randomBytes(32).toString('hex');
	hint(
		`A secure API secret has been auto-generated: ${autoSecret.slice(0, 8)}...`,
	);
	const useAutoSecret = await confirm('Use auto-generated API secret?', true);
	const apiSecret = useAutoSecret
		? autoSecret
		: await ask('Custom API secret (32+ characters recommended)', '', true);

	const apiAllowedOrigin = await ask(
		'Allowed origin(s) for CORS comma-separated',
		'http://localhost:8000',
	);

	hint(
		'Top.gg integration is optional. Required only for vote-locked features.',
	);
	const enableTopgg = await confirm('Configure Top.gg integration?', false);

	let topggApiKey = '';
	let topggAuthToken = '';
	let webhookVoteLogs = '';
	if (enableTopgg) {
		topggApiKey = await ask('Top.gg API key', '', true);
		topggAuthToken = await ask('Top.gg webhook auth token', '', true);
		webhookVoteLogs = await ask('Vote log webhook URL (optional)', '');
	}

	const webhookGuildInviteLeave = await ask(
		'Guild invite/leave log webhook URL (optional)',
		'',
	);
	const webhookErrorLogs = await ask('Error log webhook URL (optional)', '');

	return {
		apiUrl,
		apiPort,
		apiSecret,
		apiAllowedOrigin,
		topggApiKey,
		topggAuthToken,
		webhookVoteLogs,
		webhookGuildInviteLeave,
		webhookErrorLogs,
	};
};

/** Maps this addon's result fields to .env variable names */
module.exports.toEnv = (config) => ({
	API_SECRET: config.apiSecret || '',
	API_URL: config.apiUrl || '',
	API_PORT: config.apiPort || '3000',
	API_ALLOWED_ORIGIN: config.apiAllowedOrigin || '',
	TOPGG_API_KEY: config.topggApiKey || '',
	TOPGG_AUTH_TOKEN: config.topggAuthToken || '',
	WEBHOOK_VOTE_LOGS: config.webhookVoteLogs || '',
	WEBHOOK_GUILD_INVITE_LEAVE: config.webhookGuildInviteLeave || '',
	WEBHOOK_ERROR_LOGS: config.webhookErrorLogs || '',
});
