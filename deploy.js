/**
 * 🚀 Command Deployment Entrypoint
 *
 * @file deploy.js
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 *
 * @description
 * Runs the command deployment pipeline for the bot. It loads all addons,
 * aggregates their commands, and pushes the final command set to Discord.
 *
 * ✨ Core Features:
 * - Loads all addons and collects their commands
 * - Deploys global and/or guild commands depending on configuration
 * - Robust logging and clear success/failure exit codes
 */
require('module-alias/register');
const Kythia = require('./src/Kythia');
const logger = require('@utils/logger');

(async () => {
    logger.info('🔧 Starting command deployment process...');

    const deployer = new Kythia();

    try {
        const allCommands = await deployer._loadAddons();

        await deployer._deployCommands(allCommands);

        logger.info('✅ Command deployment process finished successfully.');
        process.exit(0);
    } catch (error) {
        logger.error('❌ Command deployment failed:', error);
        process.exit(1);
    }
})();
