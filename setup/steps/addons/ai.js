/**
 * @file setup/steps/addons/ai.js
 * @description Per-addon config step for the AI (Gemini) addon
 * @copyright © 2026 kenndeclouv
 */

/** biome-ignore-all lint/suspicious/noConsole: not the bot log, ignore console warn */

const { ask, hint } = require('../../prompt');

/**
 * @param {string} addonName
 * @returns {Promise<object>} config fields merged into the addon result
 */
module.exports = async (_addonName) => {
	hint('Get free Gemini API keys at: https://aistudio.google.com/apikey');
	const geminiApiKeys = await ask(
		'Gemini API key(s) comma-separated',
		'',
		true,
	);

	hint('Get free Groq API key at: https://console.groq.com/keys');
	const groqApiKey = await ask('Groq API key', '', true);

	const geminiImagenApiKeys = await ask(
		'Gemini Imagen API key(s) (optional, requires billing)',
		'',
		true,
	);

	return { geminiApiKeys, groqApiKey, geminiImagenApiKeys };
};

/** Maps this addon's result fields to .env variable names */
module.exports.toEnv = (config) => ({
	GEMINI_API_KEYS: config.geminiApiKeys || '',
	GEMINI_IMAGEN_API_KEYS: config.geminiImagenApiKeys || '',
	GROQ_API_KEY: config.groqApiKey || '',
});
