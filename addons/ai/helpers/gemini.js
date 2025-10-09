/**
 * @namespace: addons/ai/helpers/gemini.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */

const { Mutex } = require('async-mutex');
const fs = require('fs').promises;
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
const logger = require('@utils/logger');

const GEMINI_API_KEYS = (kythia.addons.ai.geminiApiKeys || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
const GEMINI_TOKEN_COUNT = GEMINI_API_KEYS.length;
const tempDirPath = path.join(__dirname, '..', 'temp');
const aiUsageFilePath = path.join(tempDirPath, 'ai_usage.json');
const PER_MINUTE_AI_LIMIT = kythia.addons.ai.perMinuteAiLimit;
const tokenMutex = new Mutex();

/**
 * 🗂️ ensureTempDir
 * Pastikan folder temp ada, buat jika belum ada.
 */
async function ensureTempDir() {
    try {
        await fs.mkdir(tempDirPath, { recursive: true });
    } catch (e) {
        // Ignore if already exists or error
    }
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
        let data = JSON.parse(raw);
        const minuteKey = new Date().toISOString().slice(0, 16);
        if (!Array.isArray(data) || data.length !== GEMINI_TOKEN_COUNT) {
            throw new Error('Invalid usage data.');
        }
        let needsSave = false;
        for (let i = 0; i < data.length; i++) {
            if (data[i].minute !== minuteKey) {
                data[i].minute = minuteKey;
                data[i].count = 0;
                needsSave = true;
            }
        }
        if (needsSave) await saveUsageData(data);
        return data;
    } catch (e) {
        const minuteKey = new Date().toISOString().slice(0, 16);
        const data = GEMINI_API_KEYS.map(() => ({ minute: minuteKey, count: 0 }));
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
    await fs.writeFile(aiUsageFilePath, JSON.stringify(data, null, 2));
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
        await fs.writeFile(metaPath, JSON.stringify(initialMeta, null, 2));
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
    await fs.writeFile(metaPath, JSON.stringify(meta, null, 2));
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
        if (GEMINI_TOKEN_COUNT === 0) return -1;
        let meta = await getUsageMeta('ai_usage_meta.json', 'lastIndex');
        let startIdx =
            typeof meta.lastIndex === 'number' && meta.lastIndex >= 0 && meta.lastIndex < GEMINI_TOKEN_COUNT ? meta.lastIndex : 0;
        for (let i = 0; i < GEMINI_TOKEN_COUNT; i++) {
            const idx = (startIdx + i) % GEMINI_TOKEN_COUNT;
            if (usageData[idx].count < PER_MINUTE_AI_LIMIT) {
                usageData[idx].count++;
                await saveUsageData(usageData);
                meta.lastIndex = (idx + 1) % GEMINI_TOKEN_COUNT;
                await setUsageMeta('ai_usage_meta.json', meta);
                logger.debug(`🎉 AI Token ${idx}`);
                return idx;
            }
        }
        return -1;
    } finally {
        release();
    }
}

/**
 * 🔄 generateContent
 * Ask Gemini with a prompt.
 * @param {string} prompt
 * @returns {Promise<string>} response
 */
async function generateContent(prompt) {
    const tokenIdx = await getAndUseNextAvailableToken();
    if (tokenIdx === -1) {
        return null;
    }
    const GEMINI_API_KEY = kythia.addons.ai.geminiApiKeys.split(',')[tokenIdx];
    if (!GEMINI_API_KEY) {
        return null;
    }
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const response = await ai.models.generateContent({ model: kythia.addons.ai.model, contents: prompt });
    return response.text || response.response?.text || null;
}

module.exports = {
    getAndUseNextAvailableToken,
    generateContent,
};
