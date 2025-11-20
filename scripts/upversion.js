/**
 * @namespace: scripts/upversion.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

/**
 * 🤖 Kythia Version Updater Script
 *
 * @file scripts/upversion.js
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 *
 * @description
 * This script scans all JavaScript files in the project and updates the
 * @version 0.9.12-beta in file headers to match the version specified in package.json.
 * It ignores certain directories and files, and logs all changes to the console.
 *
 * ✨ Main Features:
 * - Reads the current version from package.json.
 * - Recursively finds all .js files in the project, excluding ignored paths.
 * - Updates the @version 0.9.12-beta in file headers to the latest version.
 * - Logs updated files and errors to the console.
 */

require('dotenv').config();
require('../kythia.config.js');

const fs = require('fs');
const path = require('path');

const pkgPath = path.resolve(__dirname, '../package.json');
let pkg;
try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
} catch (err) {
    console.error(`Failed to read or parse package.json at ${pkgPath}:`, err);
    process.exit(1);
}
const version = pkg.version;
console.log(`Using version from package.json: ${version} ✨`);

const ignoredPaths = ['node_modules', '.git', '.env', 'dist', 'obfuscate.js'];

function getAllJsFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const fullPath = path.join(dir, file);
        if (ignoredPaths.includes(path.basename(fullPath))) {
            return;
        }
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            getAllJsFiles(fullPath, fileList);
        } else if (file.endsWith('.js')) {
            fileList.push(fullPath);
        }
    });
    return fileList;
}
const projectDir = path.resolve(__dirname, '../');
const jsFiles = getAllJsFiles(projectDir);

const versionRegex = /(@version\s+)v?[\d\.\-a-zA-Z]+/g;

jsFiles.forEach((file) => {
    try {
        const originalContent = fs.readFileSync(file, 'utf8');

        const newContent = originalContent.replace(versionRegex, `$1${version}`);

        if (originalContent !== newContent) {
            fs.writeFileSync(file, newContent, 'utf8');
            console.log(`✅ Version updated in: ${path.relative(process.cwd(), file)}`);
        }
    } catch (err) {
        console.error(`❌ Failed to process file: ${file}`, err);
    }
});

console.log('\nProcess completed!');
