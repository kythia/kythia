/**
 * @namespace: scripts/check_t_ast.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

/**
 * @file scripts/check_t_ast.js
 * @description AST-based Translation Key Linter.
 * Scans JS/TS files, finds t() calls (including some dynamic keys),
 * and verifies against nested language files.
 * More accurate than Regex, but slower and more complex.
 * @copyright © 2025 kenndeclouv
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const PROJECT_ROOT = path.join(__dirname, '..');
const SCAN_DIRECTORIES = ['addons', 'src'];
const LANG_DIR = path.join(PROJECT_ROOT, 'src', 'lang');
const DEFAULT_LANG = 'en';
const IGNORE_PATTERNS = [
    '**/node_modules/**',
    '**/dist/**',
    '**/tests/**',
    '**/assets/**',
    '**/dashboard/web/public/**',
    '**/temp/**',
    '**/leetMap.js',
    '**/generate_*.js',
    '**/refactor_*.js',
    '**/undo_*.js',
    '**/*.d.ts',
];

const locales = {};
const usedStaticKeys = new Set();
const usedDynamicKeys = new Set();
const unanalyzableKeys = new Set();
let filesScanned = 0;
let filesWithErrors = 0;

console.log('--- Kythia AST Translation Linter ---');

function hasNestedKey(obj, pathExpr) {
    if (!obj || !pathExpr) return false;
    const parts = pathExpr.split('.');
    let current = obj;
    for (const part of parts) {
        if (typeof current !== 'object' || current === null || !Object.prototype.hasOwnProperty.call(current, part)) {
            return false;
        }
        current = current[part];
    }
    return true;
}

function loadLocales() {
    console.log(`\n🔍 Reading language files from: ${LANG_DIR}`);
    try {
        const langFiles = fs
            .readdirSync(LANG_DIR)
            .filter((file) => file.endsWith('.json') && !file.includes('_flat') && !file.includes('_FLAT'));
        if (langFiles.length === 0) {
            console.error('\x1b[31m%s\x1b[0m', '❌ No .json files found in the language folder.');
            return false;
        }
        for (const file of langFiles) {
            const lang = file.replace('.json', '');
            const content = fs.readFileSync(path.join(LANG_DIR, file), 'utf8');
            try {
                locales[lang] = JSON.parse(content);
                console.log(`  > Successfully loaded: ${file}`);
            } catch (jsonError) {
                console.error(`\x1b[31m%s\x1b[0m`, `❌ Failed to parse JSON: ${file} - ${jsonError.message}`);
                filesWithErrors++;
            }
        }

        if (!locales[DEFAULT_LANG]) {
            console.error(`\x1b[31m%s\x1b[0m`, `❌ Default language (${DEFAULT_LANG}) not found!`);
            return false;
        }
        return true;
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `❌ Failed to load language files: ${error.message}`);
        return false;
    }
}

console.log(`\nScanning .js/.ts files in: ${SCAN_DIRECTORIES.join(', ')}...`);

SCAN_DIRECTORIES.forEach((dirName) => {
    const dirPath = path.join(PROJECT_ROOT, dirName);
    const files = glob.sync(`${dirPath}/**/*.{js,ts}`, { ignore: IGNORE_PATTERNS, dot: true });

    files.forEach((filePath) => {
        filesScanned++;
        process.stdout.write(`\rScanning: ${filesScanned} files...`);
        try {
            const code = fs.readFileSync(filePath, 'utf8');
            const ast = parser.parse(code, {
                sourceType: 'module',
                plugins: ['typescript', 'jsx', 'classProperties', 'objectRestSpread'],
                errorRecovery: true,
            });

            traverse(ast, {
                CallExpression(nodePath) {
                    const node = nodePath.node;

                    if (node.callee.type === 'Identifier' && node.callee.name === 't') {
                        if (node.arguments.length >= 2) {
                            const keyArg = node.arguments[1];

                            if (keyArg.type === 'StringLiteral') {
                                usedStaticKeys.add(keyArg.value);
                            } else if (keyArg.type === 'TemplateLiteral') {
                                let pattern = '';
                                keyArg.quasis.forEach((quasi, i) => {
                                    pattern += quasi.value.raw;
                                    if (!quasi.tail) {
                                        pattern += '*';
                                    }
                                });

                                pattern = pattern.replace(/_/g, '.');
                                usedDynamicKeys.add(pattern);
                            } else if (keyArg.type === 'BinaryExpression' && keyArg.operator === '+') {
                                if (keyArg.left.type === 'StringLiteral') {
                                    let pattern = keyArg.left.value.replace(/_/g, '.') + '*';
                                    usedDynamicKeys.add(pattern);
                                } else {
                                    unanalyzableKeys.add(`Complex (+) at ${path.relative(PROJECT_ROOT, filePath)}:${node.loc?.start.line}`);
                                }
                            } else {
                                unanalyzableKeys.add(`Variable/Other at ${path.relative(PROJECT_ROOT, filePath)}:${node.loc?.start.line}`);
                            }
                        }
                    }
                },
            });
        } catch (parseError) {
            if (parseError.message.includes('Unexpected token')) {
                console.warn(
                    `\n\x1b[33m[WARN] Syntax Error parsing ${path.relative(PROJECT_ROOT, filePath)}:${parseError.loc?.line} - ${parseError.message}\x1b[0m`
                );
            } else {
                console.error(`\n\x1b[31m[ERROR] Failed to parse ${path.relative(PROJECT_ROOT, filePath)}: ${parseError.message}\x1b[0m`);
            }
            filesWithErrors++;
        }
    });
});
process.stdout.write('\r'.padEnd(process.stdout.columns) + '\r');
console.log(`\nScan completed. Total ${filesScanned} files processed.`);
console.log(`  > Found \x1b[33m${usedStaticKeys.size}\x1b[0m static keys.`);
console.log(`  > Found \x1b[33m${usedDynamicKeys.size}\x1b[0m dynamic key patterns (check manually!).`);
if (unanalyzableKeys.size > 0) {
    console.log(`  > \x1b[31m${unanalyzableKeys.size}\x1b[0m t() calls could not be analyzed (variable/complex).`);
}

console.log('\nVerifying static keys against language files...');
let totalMissingStatic = 0;

for (const lang in locales) {
    let missingInLang = [];
    for (const staticKey of usedStaticKeys) {
        if (!hasNestedKey(locales[lang], staticKey)) {
            missingInLang.push(staticKey);
        }
    }

    if (missingInLang.length > 0) {
        console.log(`\n❌ \x1b[31m[${lang.toUpperCase()}] Found ${missingInLang.length} missing static keys:\x1b[0m`);
        missingInLang.sort().forEach((key) => console.log(`  - ${key}`));
        totalMissingStatic += missingInLang.length;
        filesWithErrors++;
    } else {
        console.log(`\n✅ \x1b[32m[${lang.toUpperCase()}] All static keys found!\x1b[0m`);
    }
}

if (usedDynamicKeys.size > 0) {
    console.log(`\n\n⚠️ \x1b[33mDynamic Key Patterns Detected (Check Manually):\x1b[0m`);
    [...usedDynamicKeys].sort().forEach((pattern) => console.log(`  - ${pattern}`));
    console.log(`   (Ensure all possible keys from these patterns exist in the language files)`);
}
if (unanalyzableKeys.size > 0) {
    console.log(`\n\n⚠️ \x1b[31mComplex/Unanalyzable t() Calls (Check Manually):\x1b[0m`);
    [...unanalyzableKeys].sort().forEach((loc) => console.log(`  - ${loc}`));
}

console.log(`\nChecking UNUSED keys (based on ${DEFAULT_LANG}.json)...`);
const defaultLocale = locales[DEFAULT_LANG];
let allDefinedKeys = new Set();
if (defaultLocale) {
    function getAllKeys(obj, prefix = '') {
        Object.keys(obj).forEach((key) => {
            if (key === '_value' || key === 'text') {
                if (Object.keys(obj).length === 1) return;

                if (prefix) allDefinedKeys.add(prefix);
                return;
            }

            const fullKey = prefix ? `${prefix}.${key}` : key;
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                if (key !== 'jobs' && key !== 'shop') {
                    getAllKeys(obj[key], fullKey);
                } else {
                    allDefinedKeys.add(fullKey);
                }
            } else {
                allDefinedKeys.add(fullKey);
            }
        });
    }
    try {
        getAllKeys(defaultLocale);
    } catch (e) {
        console.error('Error collecting defined keys:', e);
    }

    let unusedKeys = [];
    for (const definedKey of allDefinedKeys) {
        if (!usedStaticKeys.has(definedKey)) {
            let matchedByDynamic = false;
            for (const dynamicPattern of usedDynamicKeys) {
                const regexPattern = '^' + dynamicPattern.replace(/\./g, '\\.').replace(/\*/g, '[^.]+?') + '$';
                if (new RegExp(regexPattern).test(definedKey)) {
                    matchedByDynamic = true;
                    break;
                }
            }
            if (!matchedByDynamic) {
                unusedKeys.push(definedKey);
            }
        }
    }

    if (unusedKeys.length > 0) {
        console.log(
            `\n⚠️ \x1b[33mFound ${unusedKeys.length} UNUSED keys in ${DEFAULT_LANG}.json (don't match static/dynamic patterns):\x1b[0m`
        );
        unusedKeys.sort().forEach((key) => console.log(`  - ${key}`));
    } else {
        console.log(`\n✅ \x1b[32m[${DEFAULT_LANG.toUpperCase()}] No unused keys found.\x1b[0m`);
    }
} else {
    console.warn(`\n\x1b[33m[WARN] Cannot check unused keys because ${DEFAULT_LANG}.json failed to load.\x1b[0m`);
}

console.log('\n--- Done ---');
if (filesWithErrors > 0 || totalMissingStatic > 0) {
    console.log(
        `\x1b[31mTotal ${totalMissingStatic} missing static key errors + ${filesWithErrors - totalMissingStatic} file errors found. Please fix them.\x1b[0m`
    );
    process.exit(1);
} else {
    console.log('\x1b[32mCongratulations! Language files (for static keys) are already synced with the code.\x1b[0m');
    if (usedDynamicKeys.size > 0 || unanalyzableKeys.size > 0) {
        console.log("\x1b[33mHowever, don't forget to manually check the reported dynamic/complex keys above!\x1b[0m");
    }
}
