/**
 * @namespace: addons/ai/helpers/gemini.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { GoogleGenAI } = require('@google/genai');
const { Mutex } = require('async-mutex');
const fs = require('node:fs').promises;
const path = require('node:path');

let _logger = console;
let _aiConfig = {};
let _GEMINI_API_KEYS = [];
let _GEMINI_TOKEN_COUNT = 0;
let _PER_MINUTE_AI_LIMIT = 60;

const tokenMutex = new Mutex();
const tempDirPath = path.join(__dirname, '..', 'temp');
const aiUsageFilePath = path.join(tempDirPath, 'ai_usage.json');

/**
 * 💉 Injects dependencies needed by this module.
 * MUST be called once during application startup.
 * @param {object} deps - Dependencies object
 * @param {object} deps.logger - The logger instance
 * @param {object} deps.config - The main application config object
 */
function init({ logger, config }) {
	if (!logger || !config) {
		throw new Error('Gemini helper requires logger and config during init.');
	}
	_logger = logger;
	_aiConfig = config.addons?.ai || {};
	_GEMINI_API_KEYS = (_aiConfig.geminiApiKeys || '')
		.split(',')
		.map((t) => t.trim())
		.filter(Boolean);
	_GEMINI_TOKEN_COUNT = _GEMINI_API_KEYS.length;
	_PER_MINUTE_AI_LIMIT = _aiConfig.perMinuteAiLimit || 60;
	_logger.info(
		`✅ Gemini helper initialized with ${_GEMINI_TOKEN_COUNT} API keys.`,
		{ label: 'ai' },
	);
}

/**
 * 🗂️ ensureTempDir
 */
async function ensureTempDir() {
	try {
		await fs.mkdir(tempDirPath, { recursive: true });
	} catch (_e) {}
}

/**
 * 📊 loadUsageData
 * Read AI token usage data from file, reset if minute has changed.
 * @returns {Promise<Array<{minute: string, count: number}>>}
 */
async function loadUsageData() {
	await ensureTempDir();
	try {
		const raw = await fs.readFile(aiUsageFilePath, 'utf-8');
		const data = JSON.parse(raw);
		const minuteKey = new Date().toISOString().slice(0, 16);
		if (!Array.isArray(data) || data.length !== _GEMINI_TOKEN_COUNT) {
			throw new Error('Invalid usage data or token count changed.');
		}
		let needsSave = false;
		for (let i = 0; i < data.length; i++) {
			if (!data[i] || data[i].minute !== minuteKey) {
				data[i] = { minute: minuteKey, count: 0 };
				needsSave = true;
			}
		}
		if (needsSave) await saveUsageData(data);
		return data;
	} catch (e) {
		_logger.warn(
			`Error loading usage data or file not found/invalid: ${e.message}. Resetting...`,
			{ label: 'gemini' },
		);
		const minuteKey = new Date().toISOString().slice(0, 16);
		const data = Array.from({ length: _GEMINI_TOKEN_COUNT }, () => ({
			minute: minuteKey,
			count: 0,
		}));
		await saveUsageData(data);
		return data;
	}
}

/**
 * 💾 saveUsageData
 * Save AI token usage data to file.
 * @param {Array} data
 */
async function saveUsageData(data) {
	await ensureTempDir();
	try {
		await fs.writeFile(aiUsageFilePath, JSON.stringify(data, null, 2));
	} catch (err) {
		_logger.error(`Failed to save AI usage data: ${err.message || err}`, {
			label: 'gemini',
		});
	}
}

/**
 * 🗝️ getUsageMeta
 * Get AI usage meta data (like: lastIndex) from file.
 * @param {string} file
 * @param {string} key
 * @returns {Promise<object>}
 */
async function getUsageMeta(file, key) {
	const metaPath = path.join(tempDirPath, file);
	await ensureTempDir();
	try {
		const data = await fs.readFile(metaPath, 'utf-8');
		return JSON.parse(data);
	} catch {
		const initialMeta = { [key]: 0 };
		try {
			await fs.writeFile(metaPath, JSON.stringify(initialMeta, null, 2));
		} catch (err) {
			_logger.error(
				`Failed to write initial meta file ${file}: ${err.message}`,
				{ label: 'gemini' },
			);
		}
		return initialMeta;
	}
}

/**
 * 💾 setUsageMeta
 * Save AI usage meta data to file.
 * @param {string} file
 * @param {object} meta
 */
async function setUsageMeta(file, meta) {
	const metaPath = path.join(tempDirPath, file);
	await ensureTempDir();
	try {
		await fs.writeFile(metaPath, JSON.stringify(meta, null, 2));
	} catch (err) {
		_logger.error(`Failed to save meta file ${file}: ${err.message || err}`, {
			label: 'gemini',
		});
	}
}

/**
 * 🔄 getAndUseNextAvailableToken
 * Get next available token index (not reached per minute limit), then mark it as used.
 * @returns {Promise<number>} index token, atau -1 jika semua limit
 */
async function getAndUseNextAvailableToken() {
	const release = await tokenMutex.acquire();
	try {
		const usageData = await loadUsageData();
		if (_GEMINI_TOKEN_COUNT === 0) {
			_logger.warn(`No Gemini API keys configured.`, { label: 'gemini' });
			return -1;
		}
		const meta = await getUsageMeta('ai_usage_meta.json', 'lastIndex');
		const startIdx =
			typeof meta.lastIndex === 'number' &&
			meta.lastIndex >= 0 &&
			meta.lastIndex < _GEMINI_TOKEN_COUNT
				? meta.lastIndex
				: 0;
		for (let i = 0; i < _GEMINI_TOKEN_COUNT; i++) {
			const idx = (startIdx + i) % _GEMINI_TOKEN_COUNT;
			if (usageData[idx]?.count < _PER_MINUTE_AI_LIMIT) {
				usageData[idx].count++;
				await saveUsageData(usageData);
				meta.lastIndex = (idx + 1) % _GEMINI_TOKEN_COUNT;
				await setUsageMeta('ai_usage_meta.json', meta);
				_logger.debug(`🎉 AI Token ${idx} selected.`, { label: 'ai' });
				return idx;
			}
		}
		_logger.warn(`All Gemini tokens are currently rate-limited.`, {
			label: 'gemini',
		});
		return -1;
	} finally {
		release();
	}
}

/**
 * 🔄 generateContent
 * Ask Gemini with a prompt.
 * @param {string | object | Array} promptOrContents - Prompt string, single content object, or array of content objects
 * @returns {Promise<string|null>} response text or null on failure
 */
async function generateContent(promptOrContents) {
	const tokenIdx = await getAndUseNextAvailableToken();
	if (tokenIdx === -1) {
		_logger.error(`Cannot generate content: All AI tokens are rate-limited.`, {
			label: 'gemini',
		});
		return null;
	}
	const GEMINI_API_KEY = _GEMINI_API_KEYS[tokenIdx];
	if (!GEMINI_API_KEY) {
		_logger.error(`Cannot generate content: Invalid token index ${tokenIdx}.`, {
			label: 'gemini',
		});
		return null;
	}
	const GEMINI_MODEL = _aiConfig.model || 'gemini-3-flash';

	try {
		const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
		const contents =
			typeof promptOrContents === 'string'
				? [{ role: 'user', parts: [{ text: promptOrContents }] }]
				: Array.isArray(promptOrContents)
					? promptOrContents
					: [promptOrContents];
		const response = await ai.models.generateContent({
			model: GEMINI_MODEL,
			contents,
		});
		const candidate = response?.response?.candidates?.[0];
		const text = candidate?.content?.parts?.[0]?.text;
		return text || null;
	} catch (err) {
		_logger.error(
			`Error generating content with token index ${tokenIdx}: ${err.message}`,
			{ label: 'gemini' },
		);
		return null;
	}
}

module.exports = {
	init,
	getAndUseNextAvailableToken,
	generateContent,
};
