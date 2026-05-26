/**
 * @file setup/steps/addons/music.js
 * @description Per-addon config step for the Music (Lavalink) addon
 * @copyright © 2026 kenndeclouv
 */

/** biome-ignore-all lint/suspicious/noConsole: not the bot log, ignore console warn */

const { ask, confirm, hint } = require('../../prompt');

/**
 * @param {string} addonName
 * @returns {Promise<object>} config fields merged into the addon result
 */
module.exports = async (_addonName) => {
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
		'Lavalink SSL per node (true/false, comma-separated)',
		'false',
	);

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
		lavalinkHosts,
		lavalinkPorts,
		lavalinkPasswords,
		lavalinkSecures,
		spotifyClientId,
		spotifyClientSecret,
	};
};

/** Maps this addon's result fields to .env variable names */
module.exports.toEnv = (config) => ({
	LAVALINK_HOSTS: config.lavalinkHosts || '',
	LAVALINK_PORTS: config.lavalinkPorts || '',
	LAVALINK_PASSWORDS: config.lavalinkPasswords || '',
	LAVALINK_SECURES: config.lavalinkSecures || 'false',
	SPOTIFY_CLIENT_ID: config.spotifyClientId || '',
	SPOTIFY_CLIENT_SECRET: config.spotifyClientSecret || '',
});
