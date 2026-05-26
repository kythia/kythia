/**
 * @file setup/steps/bot.js
 * @description Setup Step 2 - Discord Bot Identity
 * @copyright © 2026 kenndeclouv
 */

/** biome-ignore-all lint/suspicious/noConsole: not the bot log, ignore console warn */
const { ask, select, header, hint } = require('../prompt');

module.exports = async (totalSteps = 6) => {
	header(`Step 2 / ${totalSteps}`, '🤖 Bot Identity');

	hint(
		'Get token & client ID from: https://discord.com/developers/applications',
	);
	const token = await ask('Discord Bot Token', '', true);
	const clientId = await ask('Discord Client ID (Application ID)', '');
	const clientSecret = await ask(
		'Discord Client Secret (optional, for dashboard OAuth2)',
		'',
		true,
	);

	console.log('');
	hint(
		'Enable Developer Mode in Discord → Settings → Advanced → copy your User ID',
	);
	const ownerIds = await ask('Your Discord User ID (owner)', '');
	const ownerNames = await ask('Your username/display name', '');

	console.log('');
	const botName = await ask('Bot display name', 'Kythia');
	const color = await ask('Bot embed color (hex)', '#FFFFFF');
	const prefixes = await ask('Command prefix(es) comma-separated', '!,k!');
	const timezone = await ask('Timezone (e.g. Asia/Jakarta)', 'Asia/Jakarta');

	const status = await select(
		'Bot status',
		[
			{ label: 'Online', value: 'online' },
			{ label: 'Idle', value: 'idle' },
			{ label: 'Do Not Disturb', value: 'dnd' },
		],
		'online',
	);

	const activityType = await select(
		'Activity type',
		[
			{ label: 'Playing', value: 'Playing' },
			{ label: 'Watching', value: 'Watching' },
			{ label: 'Listening', value: 'Listening' },
			{ label: 'Custom', value: 'Custom' },
		],
		'Playing',
	);

	const activity = await ask(
		'Activity text',
		'join support https://dsc.gg/kythia',
	);

	return {
		token,
		clientId,
		clientSecret,
		ownerIds,
		ownerNames,
		botName,
		color,
		prefixes,
		timezone,
		status,
		activityType,
		activity,
	};
};
