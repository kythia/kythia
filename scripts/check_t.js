/**
 * @name: Translation Key Linter
 * @description: Scans the project for all used translation keys and checks if they exist in the language files.
 * @copyright © 2025 kenndeclouv
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// --- CONFIGURATION ---
const PROJECT_ROOT = path.join(__dirname, '..');
const SCAN_DIRECTORIES = ['addons', 'src'];
const LANG_DIR = path.join(PROJECT_ROOT, 'src', 'lang');
const IGNORE_PATTERNS = ['**/node_modules/**', '**/dist/**', '**/tests/**', '**/assets/**', '**/dashboard/**'];
// ----------------------

const locales = {};
const usedKeys = new Set();

console.log('--- Kythia Translation Linter ---');

/**
 * Deeply flattens all keys in a translation object, using dot notation.
 * @param {object} obj
 * @param {string} prefix
 * @returns {string[]}
 */
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

// Accepts t(interaction, 'key.with.dot', ...), t(null, "key_with_underscore", ...), etc.
// This matches the logic in src/utils/translator.js
const translationKeyRegex = /t\s*\([^,]+?,\s*['"]([a-zA-Z0-9]+[a-zA-Z0-9_.-]*)['"]/g;

/**
 * Loads all language files from the language directory.
 * @returns {boolean} True if all language files loaded successfully, false otherwise.
 */
function loadLocales() {
    console.log(`\n🔍 Reading language files from: ${LANG_DIR}`);
    try {
        const langFiles = fs.readdirSync(LANG_DIR).filter((file) => file.endsWith('.json'));
        if (langFiles.length === 0) {
            console.error('\x1b[31m%s\x1b[0m', '❌ No .json language files found in the language folder.');
            return false;
        }
        for (const file of langFiles) {
            const lang = file.replace('.json', '');
            const content = fs.readFileSync(path.join(LANG_DIR, file), 'utf8');
            locales[lang] = JSON.parse(content);
            console.log(`  > Successfully loaded: ${file}`);
        }
        return true;
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `❌ Failed to load language files: ${error.message}`);
        return false;
    }
}

/**
 * Scans the entire project to find all used translation keys.
 */
function findUsedKeys() {
    console.log(`\nScanning .js files in folders: ${SCAN_DIRECTORIES.join(', ')}...`);
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
    console.log(`  > Found total \x1b[33m${usedKeys.size}\x1b[0m unique keys used.`);
}

/**
 * Checks if a dot-notated key exists in a nested object.
 * @param {object} obj
 * @param {string} pathExpr
 * @returns {boolean}
 */
function hasNestedKey(obj, pathExpr) {
    if (!obj || !pathExpr) return false;
    const parts = pathExpr.split('.');
    let current = obj;
    for (const part of parts) {
        if (typeof current !== 'object' || current === null || !(part in current)) {
            return false;
        }
        current = current[part];
    }
    return true;
}

/**
 * Compares the used keys with those present in the language files.
 * @returns {number} The total number of missing keys found.
 */
function verifyKeys() {
    console.log('\nVerifying each language...');
    let totalErrors = 0;

    for (const lang in locales) {
        const missingKeys = [];
        for (const key of usedKeys) {
            // Check if the key exists in the language file (dot notation aware)
            if (!hasNestedKey(locales[lang], key)) {
                missingKeys.push(key);
            }
        }

        if (missingKeys.length > 0) {
            console.log(`\n❌ \x1b[31m[${lang.toUpperCase()}] Found ${missingKeys.length} missing keys:\x1b[0m`);
            missingKeys.forEach((key) => console.log(`  - ${key}`));
            totalErrors += missingKeys.length;
        } else {
            console.log(`\n✅ \x1b[32m[${lang.toUpperCase()}] All keys are present!\x1b[0m`);
        }
    }
    return totalErrors;
}

// --- RUN SCRIPT ---
if (loadLocales()) {
    findUsedKeys();
    const errorCount = verifyKeys();

    console.log('\n--- Finished ---');
    if (errorCount > 0) {
        console.log(`\x1b[31mTotal ${errorCount} errors found. Please update your language files.\x1b[0m`);
        process.exit(1); // Exit with error code
    } else {
        console.log('\x1b[32mCongratulations! All your language files are in sync with the code.\x1b[0m');
    }
}
