/**
 * @namespace: scripts/refactor_t.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

/**
 * 🤖 Kythia Translation Namespace Corrector
 *
 * @file scripts/refactor_t.js
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 *
 * @description
 * Scans all translation key usages in the project, corrects their namespace to match file location,
 * and prints a summary of all corrections to the console.
 * All corrections are applied automatically, but will prompt for confirmation before making changes.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const readline = require('readline');

const PROJECT_ROOT = path.join(__dirname, '..');
const SCAN_DIRECTORIES = ['addons', 'src'];
const LANG_DIR = path.join(PROJECT_ROOT, 'src', 'lang');
const IGNORE_PATTERNS = ['**/node_modules/**', '**/dist/**', '**/tests/**', '**/assets/**', '**/dashboard/**'];
const COMMON_PREFIX = 'common_';

const locales = {};
const keyUsages = [];
const translationKeyRegex = /t\s*\([^,]+?,\s*['"]([a-zA-Z0-9]+_[a-zA-Z0-9_.-]+)['"]/g;

function loadLocales() {
    try {
        const langFiles = fs.readdirSync(LANG_DIR).filter((file) => file.endsWith('.json'));
        for (const file of langFiles) {
            const lang = file.replace('.json', '');
            locales[lang] = JSON.parse(fs.readFileSync(path.join(LANG_DIR, file), 'utf8'));
        }
        return true;
    } catch (error) {
        console.error(`Failed to load locale files: ${error.message}`);
        return false;
    }
}

function collectKeysWithPaths() {
    const directoriesToScan = SCAN_DIRECTORIES.map((dir) => path.join(PROJECT_ROOT, dir));
    for (const dir of directoriesToScan) {
        const files = glob.sync(`${dir}/**/*.js`, { ignore: IGNORE_PATTERNS });
        for (const file of files) {
            const content = fs.readFileSync(file, 'utf8');
            let match;
            while ((match = translationKeyRegex.exec(content)) !== null) {
                keyUsages.push({ key: match[1], filePath: file });
            }
        }
    }
}

function generateNamespaceFromFile(filePath) {
    const relativePath = path.relative(PROJECT_ROOT, filePath);
    let cleanPath = relativePath.startsWith('addons' + path.sep) ? relativePath.substring(7) : relativePath;
    cleanPath = cleanPath.startsWith('src' + path.sep) ? cleanPath.substring(4) : cleanPath;
    cleanPath = cleanPath.replace(`commands${path.sep}`, '');
    const dirName = path.dirname(cleanPath);
    const baseName = path.basename(cleanPath, '.js');
    let namespace = path.join(dirName, baseName).replace(/[\\/]/g, '_');
    if (namespace.startsWith('.')) namespace = namespace.substring(1);
    return namespace;
}

function analyzeKeys() {
    const fixesToApply = [];
    const processedKeys = new Set();
    for (const usage of keyUsages) {
        const { key, filePath } = usage;
        if (processedKeys.has(key) || key.startsWith(COMMON_PREFIX)) {
            processedKeys.add(key);
            continue;
        }
        const expectedNamespace = generateNamespaceFromFile(filePath);
        if (key.startsWith(expectedNamespace + '_')) {
            processedKeys.add(key);
            continue;
        }
        const oldAddonNamespace = key.substring(0, key.indexOf('_'));
        const keyIdentifier = key.substring(oldAddonNamespace.length + 1);
        const newKey = `${expectedNamespace}_${keyIdentifier}`;
        fixesToApply.push({ oldKey: key, newKey, filePath });
        processedKeys.add(key);
    }
    return fixesToApply;
}

function applyFixes(fixes) {
    // Update language files
    for (const lang in locales) {
        let changed = false;
        for (const fix of fixes) {
            if (locales[lang][fix.oldKey] !== undefined) {
                locales[lang][fix.newKey] = locales[lang][fix.oldKey];
                delete locales[lang][fix.oldKey];
                changed = true;
            }
        }
        if (changed) {
            const filePath = path.join(LANG_DIR, `${lang}.json`);
            fs.writeFileSync(filePath, JSON.stringify(locales[lang], null, 2) + '\n');
        }
    }

    // Update source files
    const filesToChange = fixes.reduce((acc, fix) => {
        if (!acc[fix.filePath]) acc[fix.filePath] = [];
        acc[fix.filePath].push({ oldKey: fix.oldKey, newKey: fix.newKey });
        return acc;
    }, {});

    for (const filePath in filesToChange) {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;
        for (const change of filesToChange[filePath]) {
            const regex = new RegExp(`(['"])${change.oldKey}\\1`, 'g');
            if (content.match(regex)) {
                content = content.replace(regex, `$1${change.newKey}$1`);
                changed = true;
            }
        }
        if (changed) {
            fs.writeFileSync(filePath, content);
        }
    }
}

function printFixes(fixes) {
    if (fixes.length === 0) {
        console.log('\x1b[32mAll translation keys are correctly namespaced.\x1b[0m');
        return;
    }
    console.log('\x1b[33m--- Translation Key Namespace Corrections ---\x1b[0m');
    for (const fix of fixes) {
        console.log(`\x1b[36m${fix.filePath}\x1b[0m: \x1b[31m${fix.oldKey}\x1b[0m → \x1b[32m${fix.newKey}\x1b[0m`);
    }
    console.log(`\n\x1b[32m${fixes.length} translation key(s) will be corrected.\x1b[0m`);
}

function askConfirmation(question) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim().toLowerCase());
        });
    });
}

async function main() {
    if (!loadLocales()) return;
    collectKeysWithPaths();
    const fixes = analyzeKeys();
    printFixes(fixes);
    if (fixes.length > 0) {
        const answer = await askConfirmation('\x1b[33m\nApply these corrections? (y/N): \x1b[0m');
        if (answer === 'y' || answer === 'yes') {
            applyFixes(fixes);
            console.log('\x1b[32mAll corrections have been applied.\x1b[0m');
        } else {
            console.log('\x1b[31mNo changes were made.\x1b[0m');
        }
    }
}

main();
