/**
 * 🛡️ Kythia Obfuscation Script
 *
 * @file scripts/obfuscate.js
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 *
 * @description
 * This script obfuscates JavaScript source files in the project, copying them to the dist/obfuscated directory.
 * It preserves the project structure, skips specified files and folders, and ensures non-JS assets are copied as-is.
 *
 * ✨ Core Features:
 * - Recursively scans the project for JavaScript files to obfuscate.
 * - Skips files/folders listed in IGNORE_HARD and IGNORE_OBFUSCATE.
 * - Copies non-JS files and assets to the output directory.
 * - Maintains directory structure in the obfuscated output.
 * - Generates integrity hashes for verification.
 */

const JavaScriptObfuscator = require('javascript-obfuscator');
const { createDirectoryHash } = require('../src/utils/integrity');
const glob = require('glob');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

const SOURCE_DIR = path.join(__dirname, '..'); // Source folder (your current project)
const BUILD_DIR = path.join(__dirname, '..', 'dist', 'obfuscated'); // Destination folder for obfuscated output

// List of files/folders to COMPLETELY ignore (not copied to dist at all)
const IGNORE_HARD = [
    'node_modules/**',
    '.git/**',
    '.env',
    'dist/**',
    'obfuscate.js',
    'structure.md',
    'tests/**',
    'gen_structure.js',
    'package-lock.json',
    'jsconfig.json',
    '**.zip',
    'add_namespace.js',
    'lavalink/**',
    'commitlint.config.js',
    '.addversionrc.js',
    '.husky/**',
    'secret-layer.js',
    'build.js',
    'logs/**',
    'todo.md',
    'gen_todo.js',
    'kythia.config.js',
    'README.md',
    'SECURITY.md',
    'TOS.md',
    'changelog.md',
    'addons/ai/data/**',
    'package.json',
    'example.package.json',
    'private_key.pem',
    'scripts/*',
    'temp/*',
];

// List of files/folders to ignore from OBFUSCATION, but still copy to dist
const IGNORE_OBFUSCATE = ['addons/dashboard/web/**', 'example.kythia.config.js'];

/**
 * Simple glob pattern matcher for a subset of glob patterns.
 * Supports:
 *   - '**' matches any number of directories
 *   - '*' matches any sequence of characters except '/'
 *   - pattern ending with '/**' matches all files under a directory
 *   - pattern starting with '**.' matches all files with extension
 *   - pattern like '**.zip' matches all .zip files anywhere
 *   - exact file or directory names
 * @param {string} filePath
 * @param {string[]} patterns
 * @returns {boolean}
 */
function isMatchAnyPattern(filePath, patterns) {
    // Normalize slashes for cross-platform
    const normalizedPath = filePath.replace(/\\/g, '/');
    for (const pattern of patterns) {
        // Remove leading './' if present
        let pat = pattern.replace(/\\/g, '/');
        if (pat.startsWith('./')) pat = pat.slice(2);

        // '**' matches everything
        if (pat === '**') return true;

        // '**.ext' matches any file with .ext
        if (pat.startsWith('**.')) {
            if (normalizedPath.endsWith(pat.slice(2))) return true;
        }

        // pattern ending with '/**'
        if (pat.endsWith('/**')) {
            const dir = pat.slice(0, -3);
            if (normalizedPath === dir || normalizedPath.startsWith(dir + '/')) return true;
        }

        // pattern with '*' wildcard (not at start)
        if (pat.includes('*')) {
            // Escape regex special chars except *
            const regexStr =
                '^' +
                pat
                    .split('*')
                    .map((s) => s.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&'))
                    .join('.*') +
                '$';
            const regex = new RegExp(regexStr);
            if (regex.test(normalizedPath)) return true;
        }

        // Exact match
        if (normalizedPath === pat) return true;
    }
    return false;
}

// Options for the obfuscator, you can adjust as needed.
const obfuscationOptions = {
    seed: process.env.SECRET_LAYER_TOKEN,
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    debugProtection: false,
    debugProtectionInterval: 0,
    disableConsoleOutput: false,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: true,
    renameGlobals: false,
    selfDefending: true,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 10,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayEncoding: ['base64'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 2,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 4,
    stringArrayWrappersType: 'function',
    transformObjectKeys: true,
    unicodeEscapeSequence: false,
};

/**
 * ✍️ Signs all addons in the build directory.
 * @param {string} buildPath - The root path of the build output.
 */
async function signAddons(buildPath) {
    console.log('\n✍️  Signing addons...');
    const privateKey = fs.readFileSync(path.join(__dirname, '..', 'private_key.pem')); // Pastikan private_key.pem ada di root
    const addonsDir = path.join(buildPath, 'addons');

    if (!(await fs.pathExists(addonsDir))) {
        console.log('   -> No addons directory found to sign. Skipping.');
        return;
    }

    const addonFolders = (await fs.readdir(addonsDir, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name);

    for (const addonName of addonFolders) {
        const addonPath = path.join(addonsDir, addonName);
        const addonJsonPath = path.join(addonPath, 'addon.json');

        if (!(await fs.pathExists(addonJsonPath))) {
            console.warn(`   -> ⚠️  Skipping '${addonName}': addon.json not found.`);
            continue;
        }

        // 1. Buat sidik jari dari semua file di addon (kecuali addon.json)
        const hash = await createDirectoryHash(addonPath);

        // 2. Buat tanda tangan digital
        const signer = crypto.createSign('sha256');
        signer.update(hash);
        signer.end();
        const signature = signer.sign(privateKey, 'base64');

        // 3. Tulis tanda tangan ke addon.json
        const addonJson = await fs.readJson(addonJsonPath);
        addonJson.kythia = signature;
        await fs.writeJson(addonJsonPath, addonJson, { spaces: 2 });

        console.log(`   -> ✅ Signed addon: ${addonName}`);
    }
}

/**
 * 🏗️ Build and obfuscate the project.
 * - Cleans the build directory.
 * - Finds all files except those in IGNORE_HARD.
 * - Obfuscates .js files (unless in IGNORE_OBFUSCATE), copies others as-is.
 * - Writes output to the /dist folder.
 * - Copies example.package.json as package.json (special case).
 */
async function build() {
    console.log('🚀 Starting build process...');

    // 1. Clean the build folder if it exists
    console.log('🧹 Cleaning old build folder...');
    await fs.emptyDir(BUILD_DIR);

    // 2. Find all files in the project, except those in IGNORE_HARD
    console.log('🔍 Searching for all files...');
    const files = glob.sync('**/*', {
        cwd: SOURCE_DIR,
        nodir: true,
        ignore: IGNORE_HARD,
    });

    console.log(`✅ Found ${files.length} files to process.`);

    // 3. Process each file
    for (const file of files) {
        // Skip package.json (handled separately)
        if (file === 'package.json') continue;

        const sourcePath = path.join(SOURCE_DIR, file);
        const buildPath = path.join(BUILD_DIR, file);

        // Ensure the destination folder exists
        await fs.ensureDir(path.dirname(buildPath));

        // Check if file is .js and not in IGNORE_OBFUSCATE
        if (path.extname(file) === '.js' && !isMatchAnyPattern(file, IGNORE_OBFUSCATE)) {
            // If .js file and not ignored for obfuscation, read and obfuscate
            /**
             * ✨ Obfuscate JavaScript file and write to build directory.
             */
            const code = await fs.readFile(sourcePath, 'utf8');
            let obfuscatedCode = JavaScriptObfuscator.obfuscate(code, obfuscationOptions).getObfuscatedCode();
            // Tambahkan jsdoc author di bawah file, dan description
            // Untuk version, ambil dari example.package.json
            let version = '';
            try {
                const pkg = require(path.join(__dirname, '..', 'package.json'));
                version = pkg.version || '';
            } catch (e) {
                version = '';
            }
            obfuscatedCode +=
                '\n\n/**\n' +
                ' * kythia bot project\n' +
                ` * @copyright © ${new Date().getFullYear()} kenndeclouv\n` +
                ' * @assistant chaa & graa\n' +
                ` * @version ${version}\n` +
                ' */\n';
            await fs.writeFile(buildPath, obfuscatedCode, 'utf8');
            console.log(` obfuscated: ${file}`);
        } else {
            // If not .js, or .js file ignored for obfuscation, just copy
            /**
             * 📄 Copy file as-is to build directory.
             */
            await fs.copy(sourcePath, buildPath);
            console.log(`   copied: ${file}`);
        }
    }

    // 4. Special: Copy example.package.json as package.json
    const examplePkgPath = path.join(SOURCE_DIR, 'example.package.json');
    const destPkgPath = path.join(BUILD_DIR, 'package.json');
    if (await fs.pathExists(examplePkgPath)) {
        await fs.copy(examplePkgPath, destPkgPath);
        console.log('   copied: example.package.json -> package.json');
    } else {
        console.warn('⚠️  example.package.json not found, package.json not created in build.');
    }

    await signAddons(BUILD_DIR);

    console.log('\n🎉 Build complete! Output is in the /dist folder.');
    console.log('You can now deploy the /dist folder along with package.json and node_modules.');
}

/**
 * 🏁 Entry point: Run the build process and handle errors.
 */
build().catch((err) => {
    console.error('😭 Error occurred during build:', err);
});
