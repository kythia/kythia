/**
 * @namespace: addons/core/helpers/fonts.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { registerFont } = require('canvas');
const path = require('path');
const fs = require('fs');

/**
 * Loads and registers all fonts located under the core addon fonts directory.
 * Safely no-ops when the directory or font files are not present.
 */
function loadFonts(logger) {
    const fontsDir = path.join(__dirname, '..', 'assets', 'fonts');
    if (!fs.existsSync(fontsDir)) {
        logger.warn(`🔠 Font directory not found: ${fontsDir}`);
        return;
    }

    const fontFiles = fs.readdirSync(fontsDir).filter((file) => file.endsWith('.ttf') || file.endsWith('.otf'));

    if (fontFiles.length === 0) {
        logger.warn('🔠 No font files found in the directory.');
        return;
    }

    let loadedCount = 0;
    for (const file of fontFiles) {
        try {
            const fontPath = path.join(fontsDir, file);
            // Use file name without extension as the font family name
            const fontFamily = path.parse(file).name;
            registerFont(fontPath, { family: fontFamily });
            loadedCount++;
        } catch (error) {
            logger.error(`🔠 Failed to load font: ${file}`, error);
        }
    }

    if (loadedCount > 0) {
        logger.info(`🔠 Successfully loaded and registered ${loadedCount} fonts.`);
    }
}

module.exports = loadFonts;
