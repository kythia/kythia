/**
 * @file setup/steps/ai.js
 * @description Setup Step 6 - AI Addon (Google Gemini)
 * @copyright © 2026 kenndeclouv
 */

const { ask, confirm, header, hint } = require('../prompt');

module.exports = async () => {
	header('Step 6 / 9', '🤖 AI Addon');

	const enableAI = await confirm('Enable AI (Gemini) addon?', true);

	if (!enableAI) {
		return { enableAI: false };
	}

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

	return { enableAI: true, geminiApiKeys, groqApiKey, geminiImagenApiKeys };
};
