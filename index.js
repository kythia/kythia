/**
 * 🚀 Entry Point: Kythia Discord Bot
 *
 * @file bot.js
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 *
 * @description
 * This is the worker entry point for the Kythia Discord bot. It sets up the environment,
 * loads all required modules, and starts the bot instance.
 *
 * ---
 * 📦 Dependencies:
 * - module-alias: Enables custom module path aliases for cleaner imports.
 * - dotenv: Loads environment variables from a .env file for configuration.
 * - ./src/Kythia: The main Kythia class that encapsulates all bot logic and startup routines.
 *
 * ---
 * 📝 Main Functions & Their Roles:
 *
 * 1. 🏷️ require('module-alias/register')
 *    - Registers custom module aliases as defined in package.json (`_moduleAliases`).
 *    - Allows you to use `@src`, `@utils`, etc. in your imports for better code organization.
 *    - Should be called before any other imports that use aliases.
 *
 * 2. 🤖 const Kythia = require('./src/Kythia')
 *    - Imports the main Kythia class, which contains all logic for connecting to Discord,
 *      registering commands, handling events, and managing features.
 *
 * 3. 🛠️ const kythiaInstance = new Kythia()
 *    - Instantiates the Kythia class, preparing the kythia for startup.
 *    - All configuration and dependency injection happens here.
 *
 * 4. 🚦 kythiaInstance.start()
 *    - Boots up the kythia: logs in to Discord, loads commands, sets up event listeners, etc.
 *    - This is the main trigger to bring the kythia online and operational.
 *
 * ---
 * 🛡️ Safety:
 * - All environment variables must be set in `.env` before starting.
 * - If you add new aliases, update both `package.json` and ensure this file loads them first.
 */

require('dotenv').config();
require('./kythia.config.js');

require('module-alias/register');

const path = require('path');
const Kythia = require('kythia-core');

const kythiaInstance = new Kythia({
    addonsPath: path.join(__dirname, 'addons'),
});
kythiaInstance.client.kythia = kythiaInstance;
kythiaInstance.start();
