/**
 * @file setup/steps/music.js
 * @description Setup Step 5 - Music Addon (Lavalink)
 * @copyright © 2026 kenndeclouv
 */

/** biome-ignore-all lint/suspicious/noConsole: not the bot log, ignore console warn */
const { ask, confirm, header, hint } = require('../prompt');

module.exports = async () => {
	header('Step 5 / 9', '🎵 Music Addon');

	const enableMusic = await confirm('Enable Music addon?', true);

	if (!enableMusic) {
		return { enableMusic: false };
	}

	hint(
		'Free Lavalink nodes available in Kythia Discord: https://dsc.gg/kythia',
	);
	const lavalinkHosts = await ask(
		'Lavalink host(s) comma-separated',
		'localhost',
	);
	const lavalinkPorts = await ask('Lavalink port(s) comma-separated', '2333');
	const lavalinkPasswords = await ask(
		'Lavalink password(s) comma-separated',
		'youshallnotpass',
		true,
	);
	const lavalinkSecures = await ask(
		'Lavalink SSL (true/false per node, comma-separated)',
		'false',
	);

	console.log('');
	hint(
		'Spotify support is optional. Get keys at: https://developer.spotify.com/dashboard',
	);
	const enableSpotify = await confirm('Configure Spotify integration?', false);

	let spotifyClientId = '';
	let spotifyClientSecret = '';
	if (enableSpotify) {
		spotifyClientId = await ask('Spotify Client ID', '');
		spotifyClientSecret = await ask('Spotify Client Secret', '', true);
	}

	return {
		enableMusic: true,
		lavalinkHosts,
		lavalinkPorts,
		lavalinkPasswords,
		lavalinkSecures,
		spotifyClientId,
		spotifyClientSecret,
	};
};
