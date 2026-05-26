/**
 * @file setup/steps/dashboard.js
 * @description Setup Step 7 - Dashboard / API Addon
 * @copyright © 2026 kenndeclouv
 */

const { ask, confirm, header, hint } = require('../prompt');
const crypto = require('node:crypto');

module.exports = async () => {
	header('Step 7 / 9', '🌐 Dashboard & API');

	const enableDashboard = await confirm('Enable Dashboard/API addon?', true);

	if (!enableDashboard) {
		return { enableDashboard: false };
	}

	const apiUrl = await ask(
		'Public API URL (e.g. http://localhost:3000)',
		'http://localhost:3000',
	);

	const apiPort = await ask('API port', '3000');

	const autoSecret = crypto.randomBytes(32).toString('hex');
	hint(
		`A secure API secret has been auto-generated for you: ${autoSecret.slice(0, 8)}...`,
	);
	const useAutoSecret = await confirm('Use auto-generated API secret?', true);
	const apiSecret = useAutoSecret
		? autoSecret
		: await ask('Custom API secret (32+ characters)', '', true);

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
		enableDashboard: true,
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
