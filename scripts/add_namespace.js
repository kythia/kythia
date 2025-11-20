/**
 * 🏷️ Namespace Adder & Updater for Command Files
 *
 * @file add_namespace.js
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 *
 * @description
 * This script scans your project for all command-related JavaScript files,
 * determines their type (Command, Subcommand, Command Group Definition),
 * and ensures each file has a standardized JSDoc header with the correct
 * namespace and type. It updates or inserts the header as needed for
 * consistency and maintainability across the codebase.
 *
 * ✨ Core Features:
 * - Recursively finds all .js files (excluding node_modules)
 * - Detects command type based on file location and naming
 * - Adds or updates JSDoc headers with namespace and type
 * - Designed for Kythia Discord Bot project structure
 */
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting namespace addition/update process...');

/**
 * Recursively finds all .js files inside a given directory, skipping 'node_modules'.
 * @param {string} dir - The starting directory.
 * @returns {string[]} - Array of absolute file paths to .js files.
 */
function findJsFilesRecursive(dir) {
    let results = [];
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of list) {
        if (file.name === 'node_modules') continue;
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
            results = results.concat(findJsFilesRecursive(fullPath));
        } else if (file.name.endsWith('.js')) {
            results.push(fullPath);
        }
    }
    return results;
}

/**
 * Processes a single file to add or update its namespace header.
 * @param {string} filePath - Absolute path to the file.
 */
function processFile(filePath) {
    const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
    let fileType = 'Module';
    const fileName = path.basename(filePath);
    const parentDirName = path.basename(path.dirname(filePath));
    const grandParentDirName = path.basename(path.dirname(path.dirname(filePath)));

    if (fileName === '_command.js') {
        fileType = 'Command Group Definition';
    } else if (fileName === '_group.js') {
        fileType = 'Subcommand Group Definition';
    } else if (parentDirName === 'commands' || grandParentDirName === 'commands') {
        fileType = 'Command';
    } else if (parentDirName === 'events') {
        fileType = 'Event Handler';
    } else if (parentDirName === 'helpers') {
        fileType = 'Helper Script';
    } else if (parentDirName === 'models') {
        fileType = 'Database Model';
    } else if (parentDirName === 'tasks') {
        fileType = 'Scheduled Task';
    }

    const newHeader = `/**
 * @namespace: ${relativePath}
 * @type: ${fileType}
 * @copyright © ${new Date().getFullYear()} kenndeclouv
 * @assistant chaa & graa
 * @version ${require('../package.json').version}
 */`;

    const originalContent = fs.readFileSync(filePath, 'utf8');
    const headerRegex = /\/\*\*[\s\S]*?namespace:[\s\S]*?\*\//;

    let newContent;
    if (headerRegex.test(originalContent)) {
        newContent = originalContent.replace(headerRegex, newHeader.trim());
    } else {
        newContent = `${newHeader}\n\n${originalContent}`;
    }

    if (newContent.trim() !== originalContent.trim()) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(` 🔄 Updated header in: ${relativePath}`);
    } else {
        console.log(` ✅ Header already correct in: ${relativePath}`);
    }
}

/**
 * Finds all 'commands' folders in a directory tree, skipping 'node_modules'.
 * @param {string} startDir - Directory to start searching from.
 * @returns {string[]} - Array of absolute paths to 'commands' folders.
 */
function findCommandsFolders(startDir) {
    let commandsFolders = [];
    const entries = fs.readdirSync(startDir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === 'addons') continue;
        const fullPath = path.join(startDir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'commands') {
                commandsFolders.push(fullPath);
            }
            commandsFolders = commandsFolders.concat(findCommandsFolders(fullPath));
        }
    }
    return commandsFolders;
}

let filesToProcess = [];

const addonsPath = path.join(process.cwd(), 'addons');
if (fs.existsSync(addonsPath)) {
    console.log('\n🔎 Scanning all .js files inside "addons"...');
    const addonFiles = findJsFilesRecursive(addonsPath);
    filesToProcess = filesToProcess.concat(addonFiles);
    console.log(`   -> Found ${addonFiles.length} files.`);
}

const otherRootDirs = [path.join(process.cwd(), '.'), path.join(process.cwd(), 'src')];

console.log('\n🔎 Scanning for "commands" folders in other directories...');
let commandsFolders = [];
for (const dir of otherRootDirs) {
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
        commandsFolders = commandsFolders.concat(findCommandsFolders(dir));
    }
}
commandsFolders = Array.from(new Set(commandsFolders));

if (commandsFolders.length > 0) {
    console.log(`   -> Found ${commandsFolders.length} "commands" folder(s).`);
    for (const folder of commandsFolders) {
        const commandFiles = findJsFilesRecursive(folder);
        filesToProcess = filesToProcess.concat(commandFiles);
    }
} else {
    console.log(`   -> No "commands" folders found outside of 'addons'.`);
}

filesToProcess = Array.from(new Set(filesToProcess));
console.log(`\n✨ Processing a total of ${filesToProcess.length} unique files...`);
filesToProcess.forEach(processFile);

console.log('\n✅ Namespace annotation process complete!');
