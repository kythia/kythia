/**
 * @file src/utils/fonts.js
 * @description Loads and registers all local fonts at startup for `canvas` usage.
 * Scans the core fonts directory and registers each `.ttf`/`.otf` font family name
 * based on the filename (without extension).
 * @copyright © 2025 kenndeclouv
 * @version 0.9.9-beta-rc.1
 */
const { registerFont } = require('canvas');
const logger = require('@utils/logger');
const path = require('path');
const fs = require('fs');

/**
 * Loads and registers all fonts located under the core addon fonts directory.
 * Safely no-ops when the directory or font files are not present.
 */
function loadFonts() {
    const fontsDir = path.join(__dirname, '..', '..', 'addons', 'core', 'assets', 'fonts');
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

module.exports = { loadFonts };
