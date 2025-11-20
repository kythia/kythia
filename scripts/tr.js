require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const API_KEYS = (process.env.GEMINI_API_KEYS || '').split(',').filter(Boolean);
const TARGET_LANGUAGE = 'Japan (ja)';
const INPUT_FILE = path.join(__dirname, '..', 'addons', 'core', 'lang', 'en.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'addons', 'core', 'lang', 'ja.json');
const BATCH_SIZE = 80;
const GEMINI_MODEL = 'gemini-2.5-flash';

const DELAY_BETWEEN_BATCHES_MS = 5000;
const DELAY_ON_ERROR_MS = 5000;

if (API_KEYS.length === 0) {
    console.error('❌ FATAL: GEMINI_API_KEYS not found in .env!');
    process.exit(1);
}

let keyIndex = 0;
function getNextGenAI(nextIndex = null) {
    if (typeof nextIndex === 'number') {
        keyIndex = nextIndex % API_KEYS.length;
    }
    const apiKey = API_KEYS[keyIndex];
    keyIndex = (keyIndex + 1) % API_KEYS.length;
    console.log(`[Key Rotator] Using API Key #${keyIndex === 0 ? API_KEYS.length : keyIndex}`);
    return new GoogleGenAI({ apiKey });
}

function flattenObject(obj, parentKey = '', result = {}) {
    for (const key in obj) {
        const newKey = parentKey ? `${parentKey}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            flattenObject(obj[key], newKey, result);
        } else {
            result[newKey] = obj[key];
        }
    }
    return result;
}

function unflattenObject(obj) {
    const result = {};
    for (const key in obj) {
        const keys = key.split('.');
        keys.reduce((acc, cur, i) => {
            if (i === keys.length - 1) {
                acc[cur] = obj[key];
            } else {
                acc[cur] = acc[cur] || {};
            }
            return acc[cur];
        }, result);
    }
    return result;
}

async function translateBatch(batch) {
    const placeholderMap = new Map();
    let placeholderCounter = 0;

    const processedBatch = JSON.parse(JSON.stringify(batch), (key, value) => {
        if (typeof value !== 'string') return value;
        return value.replace(/{([^{}]*)}/g, (match) => {
            if (!placeholderMap.has(match)) {
                placeholderMap.set(`__P_${placeholderCounter}__`, match);
                placeholderCounter++;
            }
            for (const [token, ph] of placeholderMap.entries()) {
                if (ph === match) return token;
            }
            return match;
        });
    });

    const prompt = `
You are a professional localization expert. Translate the JSON values from english to ${TARGET_LANGUAGE}.
- **Target Locale:** ja (choose naturally)
- **DO NOT** translate the JSON keys.
- **DO NOT** translate any placeholder tokens that look like \`__P_N__\`. Keep them exactly as they are.
- **KEEP** all original markdown (\`##\`, \`*\`, \`\\\`\`, \`\n\`).
- Respond ONLY with the translated JSON object, in a VALID JSON format.

Input:
${JSON.stringify(processedBatch, null, 2)}

Output:
`;

    let attempt = 1;
    let usedKeyIndex = keyIndex;
    while (true) {
        let genAI = getNextGenAI();
        let GEMINI_API_CLIENT = genAI;

        try {
            console.log(`[Batch] Attempt #${attempt}...`);

            const response = await GEMINI_API_CLIENT.models.generateContent({
                model: GEMINI_MODEL,
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
            });

            let text = undefined;
            if (response && typeof response.text === 'function') {
                text = response.text();
            } else if (response && typeof response.text === 'string') {
                text = response.text;
            }
            text = typeof text === 'string' ? text.trim() : '';

            if (text.startsWith('```json')) {
                text = text.substring(7, text.length - 3).trim();
            } else if (text.startsWith('```')) {
                text = text
                    .replace(/^```[a-z]*\n?/, '')
                    .replace(/```$/, '')
                    .trim();
            }

            let translatedBatch = JSON.parse(text);
            translatedBatch = JSON.parse(JSON.stringify(translatedBatch), (key, value) => {
                if (typeof value !== 'string') return value;
                return value.replace(/__P_(\d+)__/g, (match) => placeholderMap.get(match) || match);
            });

            return translatedBatch;
        } catch (e) {
            const errorMessage = e.message || '';
            console.error(`❌ Error in batch (Attempt ${attempt})...`, errorMessage);

            if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
                usedKeyIndex = (usedKeyIndex + 1) % API_KEYS.length;
                console.warn(`[RATE LIMIT] Got 429! Rotating to next API key [#${usedKeyIndex + 1}] and retrying.`);

                genAI = getNextGenAI(usedKeyIndex);
            } else {
                console.warn(`[OTHER ERROR] Waiting ${DELAY_ON_ERROR_MS / 1000} seconds...`);
                await new Promise((resolve) => setTimeout(resolve, DELAY_ON_ERROR_MS));
            }
            attempt++;
        }
    }
}

async function main() {
    console.log('🚀 Starting translation process (ENGLISH VERSION)...');
    console.log(`Reading file: ${INPUT_FILE}`);

    const idJsonString = fs.readFileSync(INPUT_FILE, 'utf8');
    const idJson = JSON.parse(idJsonString);

    console.log('Flattening JSON...');
    const flatIdJson = flattenObject(idJson);
    const flatEnJson = {};

    const allKeys = Object.keys(flatIdJson);

    let existingEnJson = {};
    if (fs.existsSync(OUTPUT_FILE)) {
        console.log(`[INFO] File ${OUTPUT_FILE} exists, continuing work...`);
        try {
            existingEnJson = flattenObject(JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8')));
        } catch (e) {
            console.warn(`[WARN] File ${OUTPUT_FILE} is corrupted, will be overwritten.`);
        }
    }

    const keysToTranslate = allKeys.filter(
        (key) => typeof flatIdJson[key] === 'string' && (!existingEnJson[key] || existingEnJson[key] === flatIdJson[key])
    );

    allKeys.forEach((key) => {
        if (!keysToTranslate.includes(key)) {
            flatEnJson[key] = existingEnJson[key] || flatIdJson[key];
        }
    });

    const totalBatches = Math.ceil(keysToTranslate.length / BATCH_SIZE);

    console.log(`✅ Total of ${allKeys.length} keys.`);
    console.log(`✅ Found ${keysToTranslate.length} keys that need translation.`);
    console.log(`✅ Divided into ${totalBatches} batches (up to ${BATCH_SIZE} keys per batch).`);

    for (let i = 0; i < totalBatches; i++) {
        console.log(`--- 🏃 Working on Batch ${i + 1} / ${totalBatches} ---`);

        const batchKeys = keysToTranslate.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
        const batchToTranslate = {};
        batchKeys.forEach((key) => {
            batchToTranslate[key] = flatIdJson[key];
        });

        if (Object.keys(batchToTranslate).length > 0) {
            const translatedBatch = await translateBatch(batchToTranslate);
            if (translatedBatch) {
                Object.assign(flatEnJson, translatedBatch);
            } else {
                Object.assign(flatEnJson, batchToTranslate);
            }
        }

        if (i < totalBatches - 1) {
            console.log(`--- 😴 Waiting ${DELAY_BETWEEN_BATCHES_MS / 1000} seconds between batches ---`);
            await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS));
        }
    }

    console.log('Unflattening JSON...');
    const enJson = unflattenObject(flatEnJson);

    console.log(`Saving to file: ${OUTPUT_FILE}`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(enJson, null, 2), 'utf8');

    console.log('🎉 Done! Translation file generated successfully.');
}

main();
