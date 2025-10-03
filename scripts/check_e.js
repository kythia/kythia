/**
 * 🔍 Unused Trasnslation key finder
 *
 * @file src/Kythia.js
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */

const path = require('path');
const glob = require('glob');
const fs = require('fs');

const PROJECT_ROOT = path.join(__dirname, '..');
const SCAN_DIRECTORIES = ['addons', 'src'];
const LANG_DIR = path.join(PROJECT_ROOT, 'src', 'lang');
const IGNORE_PATTERNS = ['**/node_modules/**', '**/dist/**', '**/tests/**', '**/assets/**', '**/dashboard/**'];

// Deeply flatten all keys in a translation object, using dot notation
function flattenKeys(obj, prefix = '') {
    let keys = [];
    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
        const value = obj[key];
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null) {
            keys = keys.concat(flattenKeys(value, fullKey));
        } else {
            keys.push(fullKey);
        }
    }
    return keys;
}

const locales = {};
const usedKeys = new Set();
// Accepts t(interaction, 'key.with.dot', ...), t(null, "key_with_underscore", ...), etc.
const translationKeyRegex = /t\s*\([^,]+?,\s*['"]([a-zA-Z0-9]+[a-zA-Z0-9_.-]*)['"]/g;

function loadLocales() {
    try {
        const langFiles = fs.readdirSync(LANG_DIR).filter((file) => file.endsWith('.json'));
        for (const file of langFiles) {
            const lang = file.replace('.json', '');
            const content = fs.readFileSync(path.join(LANG_DIR, file), 'utf8');
            locales[lang] = JSON.parse(content);
        }
        return true;
    } catch (error) {
        console.error(`Failed to load locale files: ${error.message}`);
        return false;
    }
}

function findUsedKeys() {
    const directoriesToScan = SCAN_DIRECTORIES.map((dir) => path.join(PROJECT_ROOT, dir));
    for (const dir of directoriesToScan) {
        const files = glob.sync(`${dir}/**/*.js`, { ignore: IGNORE_PATTERNS });
        for (const file of files) {
            const content = fs.readFileSync(file, 'utf8');
            let match;
            while ((match = translationKeyRegex.exec(content)) !== null) {
                usedKeys.add(match[1]);
            }
        }
    }
}

function findUnusedKeys() {
    let unused = [];
    for (const lang in locales) {
        const langFileKeys = flattenKeys(locales[lang]);
        for (const langKey of langFileKeys) {
            if (!usedKeys.has(langKey)) {
                unused.push({ lang, key: langKey });
            }
        }
    }
    return unused;
}

if (loadLocales()) {
    findUsedKeys();
    const unused = findUnusedKeys();
    if (unused.length > 0) {
        console.log(`Found ${unused.length} unused translation keys:`);
        // Group by language for clarity
        const unusedByLang = {};
        for (const { lang, key } of unused) {
            if (!unusedByLang[lang]) unusedByLang[lang] = [];
            unusedByLang[lang].push(key);
        }
        for (const lang in unusedByLang) {
            console.log(`  [${lang}]`);
            unusedByLang[lang].forEach(k => console.log(`    ${k}`));
        }
    } else {
        console.log('No unused translation keys found.');
    }
}
