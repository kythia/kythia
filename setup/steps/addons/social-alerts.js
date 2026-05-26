/**
 * @file setup/steps/addons/social-alerts.js
 * @description Per-addon config step for the Social Alerts addon (YouTube / TikTok)
 * @copyright © 2026 kenndeclouv
 */

/** biome-ignore-all lint/suspicious/noConsole: not the bot log, ignore console warn */

const { ask, hint } = require('../../prompt');

/**
 * @param {string} addonName
 * @returns {Promise<object>} config fields merged into the addon result
 */
module.exports = async (_addonName) => {
	hint(
		'YouTube API key: https://console.cloud.google.com/apis/library/youtube.googleapis.com',
	);
	const youtubeApiKey = await ask('YouTube Data API v3 Key', '');

	hint('TikTok Developer Portal: https://developers.tiktok.com/');
	const tiktokClientKey = await ask('TikTok Client Key', '');
	const tiktokClientSecret = await ask('TikTok Client Secret', '', true);

	const rsshubUrl = await ask(
		'RSSHub URL (optional, for TikTok feeds)',
		'https://rsshub.app',
	);

	return { youtubeApiKey, tiktokClientKey, tiktokClientSecret, rsshubUrl };
};

/** Maps this addon's result fields to .env variable names */
module.exports.toEnv = (config) => ({
	YOUTUBE_API_KEY: config.youtubeApiKey || '',
	TIKTOK_CLIENT_KEY: config.tiktokClientKey || '',
	TIKTOK_CLIENT_SECRET: config.tiktokClientSecret || '',
	RSSHUB_URL: config.rsshubUrl || '',
});
