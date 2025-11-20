/**
 * @namespace: scripts/check_t.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

/**
 * @name: Translation Key Linter (Nested Aware)
 * @description: Scans the project for all used translation keys (dot notation)
 * and checks if they exist in the nested language files.
 * @copyright © 2025 kenndeclouv
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// --- CONFIGURATION ---
const PROJECT_ROOT = path.join(__dirname, '..'); // Asumsi skrip ada di root project
const SCAN_DIRECTORIES = ['addons', 'src'];
const LANG_DIR = path.join(PROJECT_ROOT, 'addons', 'core', 'lang');
const IGNORE_PATTERNS = [
    '**/node_modules/**',
    '**/dist/**',
    '**/tests/**',
    '**/assets/**',
    '**/dashboard/web/public/**', // Abaikan file JS/CSS publik dashboard
    '**/temp/**', // Abaikan folder temp
];
// ----------------------

const locales = {};
const usedKeys = new Set();

console.log('--- Kythia Translation Linter (Nested Aware) ---');

// Regex buat nangkep key di t(..., 'key.a.b') atau t(..., "key.c_d")
// Udah bisa nangkep titik dan underscore
const translationKeyRegex = /t\s*\([^,]+?,\s*['"`]([a-zA-Z0-9_.-]+)['"`]/g;

/**
 * Loads all language files from the language directory.
 * @returns {boolean} True if all language files loaded successfully, false otherwise.
 */
function loadLocales() {
    console.log(`\n🔍 Reading language files from: ${LANG_DIR}`);
    try {
        const langFiles = fs
            .readdirSync(LANG_DIR)
            .filter((file) => file.endsWith('.json') && !file.includes('_flat') && !file.includes('_FLAT')); // Abaikan backup flat
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
        console.error(error.stack); // Tampilkan detail error
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
            try {
                const content = fs.readFileSync(file, 'utf8');
                let match;
                while ((match = translationKeyRegex.exec(content)) !== null) {
                    // match[1] adalah key-nya (e.g., 'common.error.generic')
                    if (match[1]) {
                        usedKeys.add(match[1]);
                    }
                }
            } catch (readError) {
                console.warn(`\x1b[33m[WARN] Skipping file due to read error: ${file} - ${readError.message}\x1b[0m`);
            }
        }
    }
    console.log(`  > Found total \x1b[33m${usedKeys.size}\x1b[0m unique keys used.`);
}

/**
 * Checks if a dot-notated key exists in a nested object.
 * @param {object} obj The language object (e.g., locales['en'])
 * @param {string} pathExpr The key to check (e.g., 'common.error.generic')
 * @returns {boolean}
 */
function hasNestedKey(obj, pathExpr) {
    if (!obj || !pathExpr) return false;
    const parts = pathExpr.split('.');
    let current = obj;
    for (const part of parts) {
        // Cek apakah 'current' adalah objek dan punya 'part' sebagai key
        if (typeof current !== 'object' || current === null || !Object.prototype.hasOwnProperty.call(current, part)) {
            return false; // Key tidak ditemukan di level ini
        }
        current = current[part]; // Pindah ke level selanjutnya
    }
    // Jika loop selesai tanpa return false, berarti key ADA
    // Kita juga cek apakah nilai akhirnya bukan objek (opsional, tapi bagus)
    // return typeof current !== 'object' || current === null;
    return true; // Key path exists
}

/**
 * Compares the used keys with those present in the language files.
 * @returns {number} The total number of missing keys found.
 */
function verifyKeys() {
    console.log('\nVerifying each language...');
    let totalErrors = 0;

    // Ambil list semua keys dari bahasa default (misal 'en') untuk cek key berlebih
    const defaultLang = Object.keys(locales)[0] || 'en'; // Asumsi bahasa pertama adalah default
    const allDefinedKeys = new Set();
    if (locales[defaultLang]) {
        function getAllKeys(obj, prefix = '') {
            Object.keys(obj).forEach((key) => {
                const fullKey = prefix ? `${prefix}.${key}` : key;
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    // Jangan masuk ke jobs atau shop karena itu data, bukan teks
                    if (key !== 'jobs' && key !== 'shop') {
                        getAllKeys(obj[key], fullKey);
                    } else {
                        allDefinedKeys.add(fullKey); // Anggap 'jobs' itu sendiri sbg key
                    }
                } else {
                    allDefinedKeys.add(fullKey);
                }
            });
        }
        getAllKeys(locales[defaultLang]);
        console.log(`  > Found ${allDefinedKeys.size} defined keys in ${defaultLang}.json for reference.`);
    }

    for (const lang in locales) {
        let missingKeys = [];
        let langErrors = 0;
        process.stdout.write(`\nVerifying ${lang.toUpperCase()}... `); // Progress

        for (const key of usedKeys) {
            // Cek key yang DIPAKAI di kode, tapi TIDAK ADA di file bahasa
            if (!hasNestedKey(locales[lang], key)) {
                missingKeys.push(key);
                langErrors++;
            }
        }

        if (missingKeys.length > 0) {
            // Pindahkan kursor ke baris baru setelah progress
            process.stdout.write('\n');
            console.log(
                `❌ \x1b[31m[${lang.toUpperCase()}] Found ${missingKeys.length} MISSING keys (used in code, but not in ${lang}.json):\x1b[0m`
            );
            missingKeys.sort().forEach((key) => console.log(`  - ${key}`));
        } else {
            // Pindahkan kursor ke baris baru setelah progress
            process.stdout.write(`\x1b[32m ✓ OK (All used keys found)\x1b[0m\n`);
        }
        totalErrors += langErrors;
    }

    // --- Cek UNUSED Keys (ada di en.json tapi ga dipake di kode) ---
    if (allDefinedKeys.size > 0) {
        let unusedKeys = [];
        for (const definedKey of allDefinedKeys) {
            if (!usedKeys.has(definedKey)) {
                unusedKeys.push(definedKey);
            }
        }
        if (unusedKeys.length > 0) {
            console.log(
                `\n\n⚠️ \x1b[33mFound ${unusedKeys.length} UNUSED keys (defined in ${defaultLang}.json, but not found in code):\x1b[0m`
            );
            unusedKeys.sort().forEach((key) => console.log(`  - ${key}`));
            // Jangan hitung ini sebagai error, cuma warning
        } else {
            console.log(`\n\n✅ \x1b[32m[${defaultLang.toUpperCase()}] No unused keys found.\x1b[0m`);
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
        console.log(`\x1b[31mTotal ${errorCount} missing key errors found. Please update your language files.\x1b[0m`);
        process.exit(1); // Exit with error code
    } else {
        console.log('\x1b[32mCongratulations! All keys used in the code are present in your language files.\x1b[0m');
    }
} else {
    process.exit(1); // Exit with error if locales failed to load
}
