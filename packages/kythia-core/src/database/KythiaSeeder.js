/**
 * 🧩 Seed Runner Utility
 *
 * @file src/database/seed.js
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 *
 * @description
 * Utility to run database seed files by name, searching both core and all addons.
 * Usage: `npm run seed <seedName>`
 *
 * Features:
 * - Looks for seed file in core (`src/database/seed/<seedName>.js`) first.
 * - Falls back to all addons (`addons/<addon>/database/seed/<seedName>.js`).
 * - Prints clear error if not found.
 */

require('dotenv').config();
require('../../kythia.config.js');

require('module-alias/register');
const path = require('path');
const fs = require('fs');

/**
 * 📂 getSeedFilePath
 *
 * Finds the absolute path to a seed file by name.
 * Priority: core seed folder, then all addons.
 *
 * @param {string} seedName - Name of the seed file (without .js)
 * @returns {string|null} - Absolute path to the seed file, or null if not found
 */
function getSeedFilePath(seedName) {
    const addonsDir = path.resolve(__dirname, '..', '..', 'addons');
    if (fs.existsSync(addonsDir)) {
        const addonFolders = fs
            .readdirSync(addonsDir, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name);

        for (const addonName of addonFolders) {
            const addonSeedPath = path.join(addonsDir, addonName, 'database', 'seed', `${seedName}.js`);
            if (fs.existsSync(addonSeedPath)) {
                return addonSeedPath;
            }
        }
    }

    // Not found
    return null;
}

/**
 *  🚀 runSeed
 *
 * Runs the seed file found by name.
 * Prints an error and exits if not found.
 *
 * @param {string} seedName - Name of the seed file (without .js)
 */
async function runSeed(seedName) {
    const filePath = getSeedFilePath(seedName);
    if (!filePath) {
        console.error(`❌ Seed file "${seedName}.js" not found in core or any addon.`);
        process.exit(1);
    }

    try {
        console.log(`\n🌱 Running seed: ${seedName}.js`);
        const seeder = require(filePath);

        // Ensure the seeder file exposes a 'seed' function
        if (typeof seeder.seed !== 'function') {
            throw new Error(`Seed file ${seedName}.js does not export a 'seed' function.`);
        }

        // Run and await the async result
        const resultMessage = await seeder.seed();
        if (resultMessage) {
            console.log(resultMessage);
        }
    } catch (error) {
        console.error(`\n🔥 An error occurred while running seed "${seedName}":`);
        console.error(error.message);
        process.exit(1);
    }
}

function getAllSeedFilePaths() {
    const paths = [];
    const rootDir = path.resolve(__dirname, '..', '..');

    // 1. Look in core
    const coreSeedDir = path.resolve(__dirname, 'seed');
    if (fs.existsSync(coreSeedDir)) {
        fs.readdirSync(coreSeedDir).forEach((file) => {
            if (file.endsWith('.js')) paths.push({ name: path.basename(file, '.js'), path: path.join(coreSeedDir, file) });
        });
    }

    // 2. Look in all addons
    const addonsDir = path.join(rootDir, 'addons');
    if (fs.existsSync(addonsDir)) {
        const addonFolders = fs.readdirSync(addonsDir);
        for (const addonName of addonFolders) {
            const addonSeedDir = path.join(addonsDir, addonName, 'database', 'seed');
            if (fs.existsSync(addonSeedDir)) {
                fs.readdirSync(addonSeedDir).forEach((file) => {
                    if (file.endsWith('.js')) paths.push({ name: path.basename(file, '.js'), path: path.join(addonSeedDir, file) });
                });
            }
        }
    }
    return paths;
}

// --- Main Entrypoint ---
// Wrap in an async IIFE to use await at top-level
(async () => {
    const args = process.argv.slice(2);
    // First argument is the command
    const command = args[0];

    if (!command) {
        console.error("❌ Please provide a seed name or the keyword 'all'.");
        console.error('   Example: `npm run seed pet`');
        console.error('   Example: `npm run seed all`');
        process.exit(1);
    }

    // If command is 'all', run every seeder discovered
    if (command.toLowerCase() === 'all') {
        console.log('🌱 Running all available seeders...');
        const allSeedFiles = getAllSeedFilePaths();

        if (allSeedFiles.length === 0) {
            console.log('🟡 No seed files found to run.');
        } else {
            for (const { name } of allSeedFiles) {
                await runSeed(name);
            }
        }
    } else {
        // Otherwise, treat it as a specific seeder name
        await runSeed(command);
    }

    console.log('\n✨ Seeding process finished.');
    process.exit(0);
})();
