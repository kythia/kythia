/**
 * @file setup/steps/addons/image.js
 * @description Per-addon config step for the Image addon (Cloudflare R2)
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
		'Setup your R2 bucket at: https://dash.cloudflare.com/<accountid>/r2/overview',
	);
	const accountId = await ask('Cloudflare R2 Account ID', '');
	const accessKeyId = await ask('R2 Access Key ID', '');
	const secretAccessKey = await ask('R2 Secret Access Key', '', true);
	const bucketName = await ask('R2 Bucket Name', '');
	const r2Endpoint = await ask('R2 Endpoint URL', '');
	const publicUrl = await ask('R2 Public URL (CDN URL)', '');

	return {
		accountId,
		accessKeyId,
		secretAccessKey,
		bucketName,
		r2Endpoint,
		publicUrl,
	};
};

/** Maps this addon's result fields to .env variable names */
module.exports.toEnv = (config) => ({
	R2_ACCOUNT_ID: config.accountId || '',
	R2_ACCESS_KEY_ID: config.accessKeyId || '',
	R2_SECRET_ACCESS_KEY: config.secretAccessKey || '',
	R2_BUCKET_NAME: config.bucketName || '',
	R2_ENDPOINT: config.r2Endpoint || '',
	R2_PUBLIC_URL: config.publicUrl || '',
});
