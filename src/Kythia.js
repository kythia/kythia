/**
 * 🤖 Main Kythia Entrypoint
 *
 * @file src/Kythia.js
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 *
 * @description
 * This file contains the main Bot class and core logic for initializing,
 * registering, and running the Discord bot, including command and interaction handlers.
 *
 * ✨ Core Features:
 * - Command, button, modal, select menu, and autocomplete handler registration.
 * - Category and feature flag mapping.
 * - REST API setup for command deployment.
 * - Integration with client and database.
 */

const {
    REST,
    Routes,
    Events,
    Collection,
    ButtonStyle,
    MessageFlags,
    EmbedBuilder,
    ButtonBuilder,
    WebhookClient,
    SeparatorBuilder,
    ActionRowBuilder,
    ContainerBuilder,
    TextDisplayBuilder,
    SlashCommandBuilder,
    SeparatorSpacingSize,
    ApplicationCommandType,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandGroupBuilder,
} = require('discord.js');
const { checkIsTeam, isOwner } = require('./utils/discord');
const ServerSetting = require('@coreModels/ServerSetting');
const KythiaVoter = require('@coreModels/KythiaVoter');
const KythiaModel = require('./database/KythiaModel');
const { loadLocales } = require('@utils/translator');
const KythiaORM = require('./database/KythiaORM');
const KythiaManager = require('./KythiaManager');
const { loadFonts } = require('./utils/fonts');
const KythiaClient = require('./KythiaClient');
const convertColor = require('./utils/color');
const AuditLogger = require('./KythiaAudit');
const exitHook = require('async-exit-hook');
const { t } = require('@utils/translator');
const User = require('@coreModels/User');
const client = require('./KythiaClient');
const logger = require('@utils/logger');
const Sentry = require('@sentry/node');
const figlet = require('figlet');
const path = require('path');
const fs = require('fs');
class Kythia {
    /**
     * 🏗️ Kythia Constructor
     * Initializes the Discord client,
     * REST API, and handler maps for buttons, modals, select menus, autocomplete, and command categories.
     * Also sets up a mapping for feature flags by category.
     */
    constructor() {
        this.client = KythiaClient();
        this.client.commands = new Collection();
        this.rest = new REST({ version: '10' }).setToken(kythia.bot.token);

        this.buttonHandlers = new Map();
        this.modalHandlers = new Map();
        this.selectMenuHandlers = new Map();
        this.autocompleteHandlers = new Map();
        this.commandCategoryMap = new Map();
        this.categoryToFeatureMap = new Map();
        this.embedDrafts = new Collection();
        this.kythiaManager = null;

        this.container = {
            kythiaManager: this.kythiaManager,
            ServerSetting: ServerSetting,
            client: this.client,
            sequelize: null,
            logger: logger,
            User: User,
            t: t,
        };

        this.client.container = this.container;

        this.client.cooldowns = new Collection();

        this.readyHooks = [];

        this.eventHandlers = new Map();
    }

    /**
     * 🔍 Check Required Config
     * Checks if all required configurations are set.
     * Throws an error if any required config is missing.
     */
    _checkRequiredConfig() {
        const requiredConfig = [
            ['bot', 'token'],
            ['bot', 'clientId'],
            ['bot', 'clientSecret'],
            ['db', 'driver'],
            ['db', 'host'],
            ['db', 'port'],
            ['db', 'name'],
            ['db', 'user'],
        ];

        const missingConfigs = [];

        for (const pathArr of requiredConfig) {
            let value = kythia;
            for (const key of pathArr) {
                value = value?.[key];
            }

            if (value === undefined || value === null || value === '') {
                missingConfigs.push(pathArr.join('.'));
            }
        }

        if (missingConfigs.length > 0) {
            logger.error('❌ Required configurations are not set:');
            for (const missing of missingConfigs) {
                logger.error(`   - ${missing}`);
            }
            process.exit(1);
        }

        logger.info('✔️  All required configurations are set');
    }

    /**
     * 🔘 Register Button Handler
     * Registers a handler function for a specific button customId.
     * Warns if the customId is already registered and will be overwritten.
     * @param {string} customId - The customId of the button.
     * @param {Function} handler - The handler function to execute.
     */
    registerButtonHandler(customId, handler) {
        if (this.buttonHandlers.has(customId)) {
            logger.warn(`[REGISTRATION] Warning: Button handler for [${customId}] already exists and will be overwritten.`);
        }
        this.buttonHandlers.set(customId, handler);
    }

    /**
     * 📝 Register Modal Handler
     * Registers a handler function for a modal, using a prefix of the customId.
     * Warns if the prefix is already registered and will be overwritten.
     * @param {string} customIdPrefix - The prefix of the modal customId.
     * @param {Function} handler - The handler function to execute.
     */
    registerModalHandler(customIdPrefix, handler) {
        if (this.modalHandlers.has(customIdPrefix)) {
            logger.warn(`[REGISTRATION] Warning: Modal handler for [${customIdPrefix}] already exists and will be overwritten.`);
        }
        this.modalHandlers.set(customIdPrefix, handler);
    }

    /**
     * 🔍 Register Autocomplete Handler
     * Registers a handler for autocomplete interactions for a specific command or subcommand.
     * Warns if the handler is already registered and will be overwritten.
     * @param {string} commandName - The command or subcommand key.
     * @param {Function} handler - The autocomplete handler function.
     */
    _registerAutocompleteHandler(commandName, handler) {
        if (this.autocompleteHandlers.has(commandName)) {
            logger.warn(`[REGISTRATION] Warning: Autocomplete handler for [${commandName}] already exists and will be overwritten.`);
        }
        this.autocompleteHandlers.set(commandName, handler);
    }

    /**
     * 🛡️ Validate License (Stub)
     * Placeholder for license validation logic for addons.
     * @param {string} licenseKey - The license key to validate.
     * @param {string} addonName - The name of the addon.
     * @returns {Promise<boolean>} Always returns true (stub).
     */
    async _validateLicense(licenseKey, addonName) {
        return true;
    }

    /**
     * 📝 Register Command Helper
     * Registers a single command file/module, adds it to the command collection, and prepares it for deployment.
     * Also registers autocomplete handler if present.
     * Throws error if duplicate command name is detected.
     * @param {Object} module - The command module.
     * @param {string} filePath - The file path of the command.
     * @param {Set} commandNamesSet - Set of already registered command names.
     * @param {Array} commandDataForDeployment - Array to collect command data for deployment.
     * @param {Object} options - Additional options (e.g., folderName).
     * @returns {Object|null} Summary object for logging, or null if not registered.
     */
    _registerCommand(module, filePath, commandNamesSet, commandDataForDeployment, permissionDefaults = {}, options = {}) {
        if (!module || !module.data) return null;

        let commandBuilder = new SlashCommandBuilder();
        if (typeof module.data === 'function') {
            module.data(commandBuilder);
        } else {
            commandBuilder = module.data;
        }

        const commandName = commandBuilder.name;
        const category = options.folderName || path.basename(path.dirname(filePath));

        const categoryDefaults = permissionDefaults[category] || {};
        const finalCommand = {
            ...categoryDefaults,
            ...module,
        };

        this.commandCategoryMap.set(commandName, category);
        if (commandNamesSet.has(commandName)) {
            throw new Error(`Duplicate command name detected: "${commandName}" in ${filePath}`);
        }

        commandNamesSet.add(commandName);
        this.client.commands.set(commandName, finalCommand);
        commandDataForDeployment.push(commandBuilder.toJSON());

        if (typeof finalCommand.autocomplete === 'function') {
            this._registerAutocompleteHandler(commandName, finalCommand.autocomplete);
        }

        return {
            type: 'single',
            name: commandName,
            folder: category,
        };
    }

    /**
     * 🧩 Load Addons & Register Commands/Events
     * Loads all addons from the addons directory, registers their commands, events, and components.
     * Handles both single and grouped command structures, and logs a summary of loaded addons.
     * @returns {Promise<Array>} Array of command data for deployment.
     */
    async _loadAddons() {
        logger.info('🔌 Loading & Registering Kythia Addons...');
        const commandDataForDeployment = [];
        const addonsDir = path.join(__dirname, '..', 'addons');
        if (!fs.existsSync(addonsDir)) return commandDataForDeployment;

        let addonFolders = fs.readdirSync(addonsDir, { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith('_'));

        let coreAddon = addonFolders.find((d) => d.name === 'core');
        let otherAddons = addonFolders.filter((d) => d.name !== 'core');
        if (coreAddon) {
            addonFolders = [coreAddon, ...otherAddons];
        }

        const commandNamesSet = new Set();
        const addonSummaries = [];

        for (const addon of addonFolders) {
            const addonDir = path.join(addonsDir, addon.name);
            let addonVersion = 'v0.0.0-alpha';
            try {
                const addonJsonPath = path.join(addonDir, 'addon.json');
                if (fs.existsSync(addonJsonPath)) {
                    let addonJson;
                    try {
                        const addonJsonRaw = fs.readFileSync(addonJsonPath, 'utf8');
                        addonJson = JSON.parse(addonJsonRaw);
                    } catch (jsonErr) {
                        logger.warn(`🔴 Failed to parse addon.json for ${addon.name}: ${jsonErr.message}`);
                        continue;
                    }

                    addonVersion = addonJson.version || 'v0.0.0-alpha';
                    if (addonJson.active === false) {
                        logger.info(`🟠 Addon ${addon.name.toUpperCase()} disabled`);
                        continue;
                    }
                    if (addonJson.featureFlag) {
                        this.commandCategoryMap.set(addon.name, addon.name);
                        this.categoryToFeatureMap.set(addon.name, addonJson.featureFlag);
                    }
                } else {
                    logger.warn(`🔴 Addon ${addon.name.toUpperCase()} is missing addon.json. Skipping.`);
                    continue;
                }
            } catch (e) {
                logger.warn(`🔴 Error reading addon.json for ${addonDir}: ${e.message}`);
                continue;
            }
            try {
                const configAddons = kythia?.addons || {};
                if (configAddons.all?.active === false) {
                    logger.info(`🟠 Addon ${addon.name.toUpperCase()} disabled via kythia config`);
                    continue;
                } else if (configAddons[addon.name]?.active === false) {
                    logger.info(`🟠 Addon ${addon.name.toUpperCase()} disabled via kythia config`);
                    continue;
                }
            } catch (e) {
                logger.warn(`🔴 Error checking config for addon ${addon.name.toUpperCase()}: ${e.message}`);
            }
            let addonPermissionDefaults = {};
            const permissionsFilePath = path.join(addonDir, 'permissions.js');

            if (fs.existsSync(permissionsFilePath)) {
                try {
                    addonPermissionDefaults = require(permissionsFilePath);
                    logger.info(`  └─> Found and loaded permission defaults for addon '${addon.name.toUpperCase()}'`);
                } catch (e) {
                    logger.warn(`  └─> Failed to load permissions.js for addon '${addon.name.toUpperCase()}': ${e.message}`);
                }
            }
            const loadedCommandsSummary = [];
            const loadedEventsSummary = [];
            const loadedRegisterSummary = [];

            const commandsPath = path.join(addonDir, 'commands');
            if (fs.existsSync(commandsPath)) {
                try {
                    const isTopLevelCommandGroup = fs.existsSync(path.join(commandsPath, '_command.js'));

                    if (isTopLevelCommandGroup) {
                        const commandDef = require(path.join(commandsPath, '_command.js'));
                        const mainBuilder = commandDef.data;
                        const mainCommandName = mainBuilder.name;
                        if (commandDef.featureFlag) {
                            this.commandCategoryMap.set(mainCommandName, addon.name);
                            this.categoryToFeatureMap.set(addon.name, commandDef.featureFlag);
                        }
                        this.commandCategoryMap.set(mainCommandName, addon.name);
                        if (commandNamesSet.has(mainCommandName)) throw new Error(`Duplicate command name: ${mainCommandName}`);
                        commandNamesSet.add(mainCommandName);

                        this.client.commands.set(mainCommandName, commandDef);

                        if (typeof commandDef.autocomplete === 'function') {
                            this._registerAutocompleteHandler(mainCommandName, commandDef.autocomplete);
                        }

                        const loadedSubcommandsSummary = [];
                        const contents = fs.readdirSync(commandsPath, { withFileTypes: true });

                        for (const item of contents) {
                            const itemPath = path.join(commandsPath, item.name);

                            if (item.isFile() && item.name.endsWith('.js') && !item.name.startsWith('_')) {
                                const subModule = require(itemPath);
                                if (subModule.subcommand !== true) continue;
                                if (!subModule.data || typeof subModule.data !== 'function') continue;

                                const subBuilder = new SlashCommandSubcommandBuilder();
                                subModule.data(subBuilder);

                                mainBuilder.addSubcommand(subBuilder);
                                this.client.commands.set(`${mainCommandName} ${subBuilder.name}`, { ...commandDef, ...subModule });
                                loadedSubcommandsSummary.push(subBuilder.name);
                            } else if (item.isDirectory()) {
                                const groupDefPath = path.join(itemPath, '_group.js');

                                if (!fs.existsSync(groupDefPath)) {
                                    continue;
                                }

                                try {
                                    const groupModule = require(groupDefPath);
                                    if (!groupModule.data || typeof groupModule.data !== 'function') continue;

                                    const groupBuilder = new SlashCommandSubcommandGroupBuilder();
                                    groupModule.data(groupBuilder);

                                    const subcommandsInGroupSummary = [];
                                    const subCommandFiles = fs.readdirSync(itemPath).filter((f) => f.endsWith('.js') && !f.startsWith('_'));

                                    for (const file of subCommandFiles) {
                                        const subCommandPath = path.join(itemPath, file);
                                        const subModule = require(subCommandPath);
                                        if (!subModule.data || typeof subModule.data !== 'function') continue;

                                        const subBuilder = new SlashCommandSubcommandBuilder();
                                        subModule.data(subBuilder);

                                        groupBuilder.addSubcommand(subBuilder);

                                        const commandKey = `${mainCommandName} ${groupBuilder.name} ${subBuilder.name}`;

                                        this.client.commands.set(commandKey, { ...commandDef, ...groupModule, ...subModule });

                                        subcommandsInGroupSummary.push(subBuilder.name);
                                    }

                                    mainBuilder.addSubcommandGroup(groupBuilder);

                                    loadedSubcommandsSummary.push({ group: groupBuilder.name, subcommands: subcommandsInGroupSummary });
                                } catch (e) {
                                    logger.error(`❌ Failed to load subcommand group from ${itemPath}:`, e);
                                }
                            }
                        }

                        commandDataForDeployment.push(mainBuilder.toJSON());
                        loadedCommandsSummary.push({ type: 'group', name: mainCommandName, subcommands: loadedSubcommandsSummary });
                    } else {
                        const commandItems = fs.readdirSync(commandsPath, { withFileTypes: true });
                        for (const item of commandItems) {
                            const itemPath = path.join(commandsPath, item.name);
                            if (item.isDirectory() && fs.existsSync(path.join(itemPath, '_command.js'))) {
                                const commandDef = require(path.join(itemPath, '_command.js'));
                                let mainBuilder;
                                if (typeof commandDef.data === 'function') {
                                    mainBuilder = new SlashCommandBuilder();
                                    commandDef.data(mainBuilder);
                                } else {
                                    mainBuilder = commandDef.data;
                                }
                                const mainCommandName = mainBuilder.name;
                                if (commandDef.featureFlag) {
                                    this.commandCategoryMap.set(mainCommandName, addon.name);
                                    this.categoryToFeatureMap.set(addon.name, commandDef.featureFlag);
                                }
                                if (commandNamesSet.has(mainCommandName)) throw new Error(`Duplicate name: ${mainCommandName}`);
                                commandNamesSet.add(mainCommandName);
                                this.client.commands.set(mainCommandName, commandDef);

                                if (typeof commandDef.autocomplete === 'function') {
                                    this._registerAutocompleteHandler(mainCommandName, commandDef.autocomplete);
                                }

                                const subcommandsList = [];
                                const groupContents = fs.readdirSync(itemPath, { withFileTypes: true });
                                for (const content of groupContents) {
                                    const contentPath = path.join(itemPath, content.name);
                                    if (content.isFile() && content.name.endsWith('.js') && !content.name.startsWith('_')) {
                                        const subModule = require(contentPath);
                                        if (!subModule.data) continue;
                                        let subBuilder = new SlashCommandSubcommandBuilder();
                                        if (typeof subModule.data === 'function') {
                                            subModule.data(subBuilder);
                                        } else {
                                            subBuilder = subModule.data;
                                        }
                                        mainBuilder.addSubcommand(subBuilder);
                                        this.client.commands.set(`${mainCommandName} ${subBuilder.name}`, { ...commandDef, ...subModule });

                                        if (typeof subModule.autocomplete === 'function') {
                                            this._registerAutocompleteHandler(
                                                `${mainCommandName} ${subBuilder.name}`,
                                                subModule.autocomplete
                                            );
                                        }

                                        subcommandsList.push(subBuilder.name);
                                    } else if (content.isDirectory() && fs.existsSync(path.join(contentPath, '_group.js'))) {
                                        const groupDef = require(path.join(contentPath, '_group.js'));
                                        let groupBuilder = new SlashCommandSubcommandGroupBuilder();
                                        if (typeof groupDef.data === 'function') {
                                            groupDef.data(groupBuilder);
                                        } else {
                                            groupBuilder = groupDef.data;
                                        }
                                        const subGroupList = [];
                                        const subGroupContents = fs.readdirSync(contentPath, { withFileTypes: true });
                                        for (const subSubItem of subGroupContents) {
                                            if (
                                                subSubItem.isFile() &&
                                                subSubItem.name.endsWith('.js') &&
                                                !subSubItem.name.startsWith('_')
                                            ) {
                                                const subSubPath = path.join(contentPath, subSubItem.name);
                                                const subSubModule = require(subSubPath);
                                                if (!subSubModule.data) continue;
                                                let subSubBuilder = new SlashCommandSubcommandBuilder();
                                                if (typeof subSubModule.data === 'function') {
                                                    subSubModule.data(subSubBuilder);
                                                } else {
                                                    subSubBuilder = subSubModule.data;
                                                }
                                                groupBuilder.addSubcommand(subSubBuilder);
                                                this.client.commands.set(`${mainCommandName} ${groupBuilder.name} ${subSubBuilder.name}`, {
                                                    ...commandDef,
                                                    ...groupDef,
                                                    ...subSubModule,
                                                });

                                                if (typeof subSubModule.autocomplete === 'function') {
                                                    this._registerAutocompleteHandler(
                                                        `${mainCommandName} ${groupBuilder.name} ${subSubBuilder.name}`,
                                                        subSubModule.autocomplete
                                                    );
                                                }

                                                subGroupList.push(subSubBuilder.name);
                                            }
                                        }
                                        mainBuilder.addSubcommandGroup(groupBuilder);
                                        subcommandsList.push({ group: groupBuilder.name, subcommands: subGroupList });
                                    }
                                }
                                commandDataForDeployment.push(mainBuilder.toJSON());
                                loadedCommandsSummary.push({ type: 'group', name: mainCommandName, subcommands: subcommandsList });
                            } else if (item.isFile() && item.name.endsWith('.js') && !item.name.startsWith('_')) {
                                const commandModule = require(itemPath);
                                if (commandModule.subcommand) continue;
                                let summary = null;

                                if (commandModule.slashCommand) {
                                    const commandBuilder = commandModule.slashCommand;
                                    const commandName = commandBuilder.name;

                                    try {
                                        const { getLocales } = require('@utils/translator');
                                        const allLocales = getLocales();

                                        let nameLocalizations = {};
                                        let descriptionLocalizations = {};
                                        if (typeof allLocales.entries === 'function') {
                                            for (const [lang, translations] of allLocales.entries()) {
                                                const nameKey = `command_${commandName}_name`;
                                                const descKey = `command_${commandName}_desc`;
                                                if (translations[nameKey]) nameLocalizations[lang] = translations[nameKey];
                                                if (translations[descKey]) descriptionLocalizations[lang] = translations[descKey];
                                            }
                                        } else {
                                            for (const lang in allLocales) {
                                                const translations = allLocales[lang];
                                                const nameKey = `command_${commandName}_name`;
                                                const descKey = `command_${commandName}_desc`;
                                                if (translations[nameKey]) nameLocalizations[lang] = translations[nameKey];
                                                if (translations[descKey]) descriptionLocalizations[lang] = translations[descKey];
                                            }
                                        }
                                        if (Object.keys(nameLocalizations).length > 0) {
                                            commandBuilder.setNameLocalizations(nameLocalizations);
                                        }
                                        if (Object.keys(descriptionLocalizations).length > 0) {
                                            commandBuilder.setDescriptionLocalizations(descriptionLocalizations);
                                        }

                                        if (Array.isArray(commandBuilder.options)) {
                                            for (const group of commandBuilder.options) {
                                                if (
                                                    typeof SlashCommandSubcommandGroupBuilder !== 'undefined' &&
                                                    group instanceof SlashCommandSubcommandGroupBuilder
                                                ) {
                                                    const groupName = group.name;

                                                    let groupDescLocalizations = {};
                                                    if (typeof allLocales.entries === 'function') {
                                                        for (const [lang, translations] of allLocales.entries()) {
                                                            const groupDescKey = `command_${commandName}_${groupName}_group_desc`;
                                                            if (translations[groupDescKey])
                                                                groupDescLocalizations[lang] = translations[groupDescKey];
                                                        }
                                                    } else {
                                                        for (const lang in allLocales) {
                                                            const translations = allLocales[lang];
                                                            const groupDescKey = `command_${commandName}_${groupName}_group_desc`;
                                                            if (translations[groupDescKey])
                                                                groupDescLocalizations[lang] = translations[groupDescKey];
                                                        }
                                                    }
                                                    if (
                                                        Object.keys(groupDescLocalizations).length > 0 &&
                                                        typeof group.setDescriptionLocalizations === 'function'
                                                    ) {
                                                        group.setDescriptionLocalizations(groupDescLocalizations);
                                                    }

                                                    if (Array.isArray(group.options)) {
                                                        for (const sub of group.options) {
                                                            const subName = sub.name;

                                                            let subDescLocalizations = {};
                                                            if (typeof allLocales.entries === 'function') {
                                                                for (const [lang, translations] of allLocales.entries()) {
                                                                    const subDescKey = `command_${commandName}_${groupName}_${subName}_desc`;
                                                                    if (translations[subDescKey])
                                                                        subDescLocalizations[lang] = translations[subDescKey];
                                                                }
                                                            } else {
                                                                for (const lang in allLocales) {
                                                                    const translations = allLocales[lang];
                                                                    const subDescKey = `command_${commandName}_${groupName}_${subName}_desc`;
                                                                    if (translations[subDescKey])
                                                                        subDescLocalizations[lang] = translations[subDescKey];
                                                                }
                                                            }
                                                            if (
                                                                Object.keys(subDescLocalizations).length > 0 &&
                                                                typeof sub.setDescriptionLocalizations === 'function'
                                                            ) {
                                                                sub.setDescriptionLocalizations(subDescLocalizations);
                                                            }

                                                            if (Array.isArray(sub.options)) {
                                                                for (const opt of sub.options) {
                                                                    const optName = opt.name;
                                                                    let optDescLocalizations = {};
                                                                    if (typeof allLocales.entries === 'function') {
                                                                        for (const [lang, translations] of allLocales.entries()) {
                                                                            const optDescKey = `command_${commandName}_${groupName}_${subName}_option_${optName}`;
                                                                            if (translations[optDescKey])
                                                                                optDescLocalizations[lang] = translations[optDescKey];
                                                                        }
                                                                    } else {
                                                                        for (const lang in allLocales) {
                                                                            const translations = allLocales[lang];
                                                                            const optDescKey = `command_${commandName}_${groupName}_${subName}_option_${optName}`;
                                                                            if (translations[optDescKey])
                                                                                optDescLocalizations[lang] = translations[optDescKey];
                                                                        }
                                                                    }
                                                                    if (
                                                                        Object.keys(optDescLocalizations).length > 0 &&
                                                                        typeof opt.setDescriptionLocalizations === 'function'
                                                                    ) {
                                                                        opt.setDescriptionLocalizations(optDescLocalizations);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                } else if (
                                                    typeof SlashCommandSubcommandBuilder !== 'undefined' &&
                                                    group instanceof SlashCommandSubcommandBuilder
                                                ) {
                                                    const subName = group.name;
                                                    let subDescLocalizations = {};
                                                    if (typeof allLocales.entries === 'function') {
                                                        for (const [lang, translations] of allLocales.entries()) {
                                                            const subDescKey = `command_${commandName}_${subName}_desc`;
                                                            if (translations[subDescKey])
                                                                subDescLocalizations[lang] = translations[subDescKey];
                                                        }
                                                    } else {
                                                        for (const lang in allLocales) {
                                                            const translations = allLocales[lang];
                                                            const subDescKey = `command_${commandName}_${subName}_desc`;
                                                            if (translations[subDescKey])
                                                                subDescLocalizations[lang] = translations[subDescKey];
                                                        }
                                                    }
                                                    if (
                                                        Object.keys(subDescLocalizations).length > 0 &&
                                                        typeof group.setDescriptionLocalizations === 'function'
                                                    ) {
                                                        group.setDescriptionLocalizations(subDescLocalizations);
                                                    }

                                                    if (Array.isArray(group.options)) {
                                                        for (const opt of group.options) {
                                                            const optName = opt.name;
                                                            let optDescLocalizations = {};
                                                            if (typeof allLocales.entries === 'function') {
                                                                for (const [lang, translations] of allLocales.entries()) {
                                                                    const optDescKey = `command_${commandName}_${subName}_option_${optName}`;
                                                                    if (translations[optDescKey])
                                                                        optDescLocalizations[lang] = translations[optDescKey];
                                                                }
                                                            } else {
                                                                for (const lang in allLocales) {
                                                                    const translations = allLocales[lang];
                                                                    const optDescKey = `command_${commandName}_${subName}_option_${optName}`;
                                                                    if (translations[optDescKey])
                                                                        optDescLocalizations[lang] = translations[optDescKey];
                                                                }
                                                            }
                                                            if (
                                                                Object.keys(optDescLocalizations).length > 0 &&
                                                                typeof opt.setDescriptionLocalizations === 'function'
                                                            ) {
                                                                opt.setDescriptionLocalizations(optDescLocalizations);
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    } catch (e) {
                                        logger.warn(`Failed to load localizations for command "${commandName}": ${e.message}`);
                                    }

                                    if (commandNamesSet.has(commandName)) {
                                        logger.warn(`Duplicate command name detected: "${commandName}" in ${itemPath}`);
                                    } else {
                                        commandNamesSet.add(commandName);
                                        this.client.commands.set(commandName, commandModule);
                                    }
                                    commandDataForDeployment.push(commandBuilder.toJSON());
                                    summary = { type: 'single', name: commandName, folder: addon.name, kind: 'slash' };
                                    if (summary) loadedCommandsSummary.push(summary);
                                    this.commandCategoryMap.set(commandName, addon.name);
                                }

                                if (commandModule.contextMenuCommand) {
                                    const commandName = commandModule.contextMenuCommand.name;
                                    if (commandNamesSet.has(commandName) && !commandModule.slashCommand) {
                                        logger.warn(`Duplicate command name detected: "${commandName}" in ${itemPath}`);
                                    } else {
                                        if (!commandNamesSet.has(commandName)) commandNamesSet.add(commandName);
                                        this.client.commands.set(commandName, commandModule);
                                    }
                                    commandDataForDeployment.push(commandModule.contextMenuCommand.toJSON());
                                    summary = { type: 'single', name: commandName, folder: addon.name, kind: 'contextMenu' };
                                    if (summary) loadedCommandsSummary.push(summary);
                                }

                                if (!commandModule.slashCommand && !commandModule.contextMenuCommand) {
                                    summary = this._registerCommand(
                                        commandModule,
                                        itemPath,
                                        commandNamesSet,
                                        commandDataForDeployment,
                                        addonPermissionDefaults,
                                        { folderName: addon.name }
                                    );
                                    if (summary) loadedCommandsSummary.push(summary);
                                }
                            } else if (item.isDirectory() && !item.name.startsWith('_')) {
                                const files = fs.readdirSync(itemPath).filter((f) => f.endsWith('.js') && !f.startsWith('_'));
                                for (const file of files) {
                                    const filePath = path.join(itemPath, file);
                                    const commandModule = require(filePath);
                                    let summary = null;

                                    if (commandModule.slashCommand) {
                                        const commandBuilder = commandModule.slashCommand;
                                        const commandName = commandBuilder.name;
                                        if (commandModule.subcommand) continue;

                                        try {
                                            const { getLocales } = require('@utils/translator');
                                            const allLocales = getLocales();

                                            let nameLocalizations = {};
                                            let descriptionLocalizations = {};
                                            if (typeof allLocales.entries === 'function') {
                                                for (const [lang, translations] of allLocales.entries()) {
                                                    const nameKey = `command_${commandName}_name`;
                                                    const descKey = `command_${commandName}_desc`;
                                                    if (translations[nameKey]) nameLocalizations[lang] = translations[nameKey];
                                                    if (translations[descKey]) descriptionLocalizations[lang] = translations[descKey];
                                                }
                                            } else {
                                                for (const lang in allLocales) {
                                                    const translations = allLocales[lang];
                                                    const nameKey = `command_${commandName}_name`;
                                                    const descKey = `command_${commandName}_desc`;
                                                    if (translations[nameKey]) nameLocalizations[lang] = translations[nameKey];
                                                    if (translations[descKey]) descriptionLocalizations[lang] = translations[descKey];
                                                }
                                            }
                                            if (Object.keys(nameLocalizations).length > 0) {
                                                commandBuilder.setNameLocalizations(nameLocalizations);
                                            }
                                            if (Object.keys(descriptionLocalizations).length > 0) {
                                                commandBuilder.setDescriptionLocalizations(descriptionLocalizations);
                                            }

                                            if (Array.isArray(commandBuilder.options)) {
                                                for (const group of commandBuilder.options) {
                                                    if (
                                                        typeof SlashCommandSubcommandGroupBuilder !== 'undefined' &&
                                                        group instanceof SlashCommandSubcommandGroupBuilder
                                                    ) {
                                                        const groupName = group.name;
                                                        let groupDescLocalizations = {};
                                                        if (typeof allLocales.entries === 'function') {
                                                            for (const [lang, translations] of allLocales.entries()) {
                                                                const groupDescKey = `command_${commandName}_${groupName}_group_desc`;
                                                                if (translations[groupDescKey])
                                                                    groupDescLocalizations[lang] = translations[groupDescKey];
                                                            }
                                                        } else {
                                                            for (const lang in allLocales) {
                                                                const translations = allLocales[lang];
                                                                const groupDescKey = `command_${commandName}_${groupName}_group_desc`;
                                                                if (translations[groupDescKey])
                                                                    groupDescLocalizations[lang] = translations[groupDescKey];
                                                            }
                                                        }
                                                        if (
                                                            Object.keys(groupDescLocalizations).length > 0 &&
                                                            typeof group.setDescriptionLocalizations === 'function'
                                                        ) {
                                                            group.setDescriptionLocalizations(groupDescLocalizations);
                                                        }

                                                        if (Array.isArray(group.options)) {
                                                            for (const sub of group.options) {
                                                                const subName = sub.name;
                                                                let subDescLocalizations = {};
                                                                if (typeof allLocales.entries === 'function') {
                                                                    for (const [lang, translations] of allLocales.entries()) {
                                                                        const subDescKey = `command_${commandName}_${groupName}_${subName}_desc`;
                                                                        if (translations[subDescKey])
                                                                            subDescLocalizations[lang] = translations[subDescKey];
                                                                    }
                                                                } else {
                                                                    for (const lang in allLocales) {
                                                                        const translations = allLocales[lang];
                                                                        const subDescKey = `command_${commandName}_${groupName}_${subName}_desc`;
                                                                        if (translations[subDescKey])
                                                                            subDescLocalizations[lang] = translations[subDescKey];
                                                                    }
                                                                }
                                                                if (
                                                                    Object.keys(subDescLocalizations).length > 0 &&
                                                                    typeof sub.setDescriptionLocalizations === 'function'
                                                                ) {
                                                                    sub.setDescriptionLocalizations(subDescLocalizations);
                                                                }

                                                                if (Array.isArray(sub.options)) {
                                                                    for (const opt of sub.options) {
                                                                        const optName = opt.name;
                                                                        let optDescLocalizations = {};
                                                                        if (typeof allLocales.entries === 'function') {
                                                                            for (const [lang, translations] of allLocales.entries()) {
                                                                                const optDescKey = `command_${commandName}_${groupName}_${subName}_option_${optName}`;
                                                                                if (translations[optDescKey])
                                                                                    optDescLocalizations[lang] = translations[optDescKey];
                                                                            }
                                                                        } else {
                                                                            for (const lang in allLocales) {
                                                                                const translations = allLocales[lang];
                                                                                const optDescKey = `command_${commandName}_${groupName}_${subName}_option_${optName}`;
                                                                                if (translations[optDescKey])
                                                                                    optDescLocalizations[lang] = translations[optDescKey];
                                                                            }
                                                                        }
                                                                        if (
                                                                            Object.keys(optDescLocalizations).length > 0 &&
                                                                            typeof opt.setDescriptionLocalizations === 'function'
                                                                        ) {
                                                                            opt.setDescriptionLocalizations(optDescLocalizations);
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    } else if (
                                                        typeof SlashCommandSubcommandBuilder !== 'undefined' &&
                                                        group instanceof SlashCommandSubcommandBuilder
                                                    ) {
                                                        const subName = group.name;
                                                        let subDescLocalizations = {};
                                                        if (typeof allLocales.entries === 'function') {
                                                            for (const [lang, translations] of allLocales.entries()) {
                                                                const subDescKey = `command_${commandName}_${subName}_desc`;
                                                                if (translations[subDescKey])
                                                                    subDescLocalizations[lang] = translations[subDescKey];
                                                            }
                                                        } else {
                                                            for (const lang in allLocales) {
                                                                const translations = allLocales[lang];
                                                                const subDescKey = `command_${commandName}_${subName}_desc`;
                                                                if (translations[subDescKey])
                                                                    subDescLocalizations[lang] = translations[subDescKey];
                                                            }
                                                        }
                                                        if (
                                                            Object.keys(subDescLocalizations).length > 0 &&
                                                            typeof group.setDescriptionLocalizations === 'function'
                                                        ) {
                                                            group.setDescriptionLocalizations(subDescLocalizations);
                                                        }

                                                        if (Array.isArray(group.options)) {
                                                            for (const opt of group.options) {
                                                                const optName = opt.name;
                                                                let optDescLocalizations = {};
                                                                if (typeof allLocales.entries === 'function') {
                                                                    for (const [lang, translations] of allLocales.entries()) {
                                                                        const optDescKey = `command_${commandName}_${subName}_option_${optName}`;
                                                                        if (translations[optDescKey])
                                                                            optDescLocalizations[lang] = translations[optDescKey];
                                                                    }
                                                                } else {
                                                                    for (const lang in allLocales) {
                                                                        const translations = allLocales[lang];
                                                                        const optDescKey = `command_${commandName}_${subName}_option_${optName}`;
                                                                        if (translations[optDescKey])
                                                                            optDescLocalizations[lang] = translations[optDescKey];
                                                                    }
                                                                }
                                                                if (
                                                                    Object.keys(optDescLocalizations).length > 0 &&
                                                                    typeof opt.setDescriptionLocalizations === 'function'
                                                                ) {
                                                                    opt.setDescriptionLocalizations(optDescLocalizations);
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        } catch (e) {
                                            logger.warn(`Failed to load localizations for command "${commandName}": ${e.message}`);
                                        }

                                        this.commandCategoryMap.set(commandName, item.name);
                                        if (commandNamesSet.has(commandName)) {
                                            logger.warn(`Duplicate slash command name detected: "${commandName}" in ${filePath}`);
                                        } else {
                                            commandNamesSet.add(commandName);
                                            this.client.commands.set(commandName, commandModule);
                                            commandDataForDeployment.push(commandBuilder.toJSON());
                                            summary = { type: 'single', name: commandName, folder: item.name, kind: 'slash' };
                                            if (summary) loadedCommandsSummary.push(summary);
                                        }
                                    }

                                    if (commandModule.contextMenuCommand) {
                                        const commandName = commandModule.contextMenuCommand.name;
                                        if (!this.client.commands.has(commandName)) {
                                            this.client.commands.set(commandName, commandModule);
                                        }
                                        commandDataForDeployment.push(commandModule.contextMenuCommand.toJSON());
                                        summary = { type: 'single', name: commandName, folder: item.name, kind: 'contextMenu' };
                                        if (summary) loadedCommandsSummary.push(summary);
                                    }

                                    if (!commandModule.slashCommand && !commandModule.contextMenuCommand) {
                                        summary = this._registerCommand(
                                            commandModule,
                                            filePath,
                                            commandNamesSet,
                                            commandDataForDeployment,
                                            addonPermissionDefaults,
                                            { folderName: item.name }
                                        );
                                        if (summary) loadedCommandsSummary.push(summary);
                                    }
                                }
                            }
                        }
                    }
                } catch (error) {
                    logger.error(`❌ Failed to load commands from addon "${addon.name}":`, error);
                }
            }

            const registerPath = path.join(addonDir, 'register.js');
            if (fs.existsSync(registerPath)) {
                try {
                    const registration = require(registerPath);
                    if (typeof registration.initialize === 'function') {
                        const registrationSummary = await registration.initialize(this);
                        if (Array.isArray(registrationSummary) && registrationSummary.length > 0) {
                            loadedRegisterSummary.push(...registrationSummary);
                        }
                    }
                } catch (error) {
                    logger.error(`❌ Failed to register components for [${addon.name}]:`, error);
                }
            }

            const eventsPath = path.join(addonDir, 'events');
            let eventFiles = [];
            if (fs.existsSync(eventsPath)) {
                eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));
                for (const file of eventFiles) {
                    const eventName = path.basename(file, '.js');
                    try {
                        const eventHandler = require(path.join(eventsPath, file));
                        if (typeof eventHandler === 'function') {
                            if (!this.eventHandlers.has(eventName)) {
                                this.eventHandlers.set(eventName, []);
                            }

                            this.eventHandlers.get(eventName).push(eventHandler);

                            loadedEventsSummary.push(eventName);
                        }
                    } catch (error) {
                        logger.error(`❌ Failed to register event [${eventName}] for [${addon.name}]:`, error);
                    }
                }
            }

            addonSummaries.push({
                name: addon.name,
                version: addonVersion,
                commands: loadedCommandsSummary,
                events: loadedEventsSummary,
                register: loadedRegisterSummary,
            });
        }

        logger.info('▬▬▬▬▬▬▬▬▬▬▬▬▬[ Addon(s) Loaded ]▬▬▬▬▬▬▬▬▬▬▬▬▬');
        for (const addon of addonSummaries) {
            logger.info(`📦  ${addon.name} (v${addon.version})`);
            logger.info('  ⚙️  Command(s)');
            if (!addon.commands.length) {
                logger.info('     (no commands registered)');
            } else {
                for (const cmd of addon.commands) {
                    if (cmd.type === 'group') {
                        logger.info(`     └─ /${cmd.name}`);
                        for (const sub of cmd.subcommands) {
                            if (typeof sub === 'string') {
                                logger.info(`        └─ ${sub}`);
                            } else if (typeof sub === 'object' && sub.group) {
                                logger.info(`          └─ [${sub.group}]`);
                                for (const subsub of sub.subcommands) {
                                    logger.info(`             └─ ${subsub}`);
                                }
                            }
                        }
                    } else if (cmd.type === 'single') {
                        let kindLabel = '';
                        if (cmd.kind === 'slash') kindLabel = ' [slash]';
                        else if (cmd.kind === 'contextMenu') kindLabel = ' [contextMenu]';
                        if (cmd.folder) {
                            logger.info(`     └─ /${cmd.name} (${cmd.folder})${kindLabel}`);
                        } else {
                            logger.info(`     └─ /${cmd.name}${kindLabel}`);
                        }
                    }
                }
            }
            if (addon.register && addon.register.length) {
                logger.info('  🧩 Component(s)');
                for (const reg of addon.register) {
                    logger.info(`   ${reg}`);
                }
            }
            if (addon.events && addon.events.length) {
                logger.info('  🔔 Event(s)');
                for (const ev of addon.events) {
                    logger.info(`     └─ ${ev}`);
                }
            }
        }

        return commandDataForDeployment;
    }

    /**
     * 🛎️ Initialize Interaction Handler
     * Sets up the main Discord interaction handler for commands, autocomplete, buttons, and modals.
     * Handles permission checks, feature flag checks, and error handling for all interaction types.
     */
    _initializeInteractionHandler() {
        function formatPerms(permsArray) {
            return permsArray.map((perm) => perm.replace(/([A-Z])/g, ' $1').trim()).join(', ');
        }
        this.client.on(Events.InteractionCreate, async (interaction) => {
            try {
                if (interaction.isChatInputCommand()) {
                    let commandKey = interaction.commandName;
                    const group = interaction.options.getSubcommandGroup(false);
                    const subcommand = interaction.options.getSubcommand(false);

                    if (group) commandKey = `${commandKey} ${group} ${subcommand}`;
                    else if (subcommand) commandKey = `${commandKey} ${subcommand}`;

                    let command = this.client.commands.get(commandKey);

                    if (!command && (subcommand || group)) {
                        command = this.client.commands.get(interaction.commandName);
                    }
                    if (!command) {
                        logger.error(`Command not found for key: ${commandKey}`);
                        return interaction.reply({ content: await t(interaction, 'common_error_command_not_found'), ephemeral: true });
                    }

                    if (interaction.inGuild()) {
                        const category = this.commandCategoryMap.get(interaction.commandName);
                        const featureFlag = this.categoryToFeatureMap.get(category);

                        if (featureFlag && !isOwner(interaction.user.id)) {
                            const settings = await ServerSetting.getCache({ guildId: interaction.guild.id });

                            if (settings && settings.hasOwnProperty(featureFlag) && settings[featureFlag] === false) {
                                const featureName = category.charAt(0).toUpperCase() + category.slice(1);
                                const reply = await t(interaction, 'common_error_feature_disabled', { feature: featureName });
                                return interaction.reply({ content: reply });
                            }
                        }
                    }

                    if (command.guildOnly && !interaction.inGuild()) {
                        return interaction.reply({ content: await t(interaction, 'common_error_guild_only'), ephemeral: true });
                    }
                    if (command.ownerOnly && !isOwner(interaction.user.id)) {
                        return interaction.reply({ content: await t(interaction, 'common_error_not_owner'), ephemeral: true });
                    }
                    if (command.teamOnly && !isOwner(interaction.user.id)) {
                        const isTeam = await checkIsTeam(interaction.user);
                        if (!isTeam) return interaction.reply({ content: await t(interaction, 'common_error_not_team'), ephemeral: true });
                    }
                    if (command.permissions && interaction.inGuild()) {
                        const missingPerms = interaction.member.permissions.missing(command.permissions);
                        if (missingPerms.length > 0)
                            return interaction.reply({
                                content: await t(interaction, 'common_error_user_missing_perms', { perms: formatPerms(missingPerms) }),
                                ephemeral: true,
                            });
                    }
                    if (command.botPermissions && interaction.inGuild()) {
                        const missingPerms = interaction.guild.members.me.permissions.missing(command.botPermissions);
                        if (missingPerms.length > 0)
                            return interaction.reply({
                                content: await t(interaction, 'common_error_bot_missing_perms', { perms: formatPerms(missingPerms) }),
                                ephemeral: true,
                            });
                    }
                    if (command.voteLocked && !isOwner(interaction.user.id)) {
                        const voter = await KythiaVoter.getCache({ userId: interaction.user.id });

                        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

                        if (!voter || voter.votedAt < twelveHoursAgo) {
                            const container = new ContainerBuilder().setAccentColor(
                                convertColor(kythia.bot.color, { from: 'hex', to: 'decimal' })
                            );
                            container.addTextDisplayComponents(
                                new TextDisplayBuilder().setContent(await t(interaction, 'common_error_vote_locked'))
                            );
                            container.addSeparatorComponents(
                                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                            );
                            container.addActionRowComponents(
                                new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                        .setLabel(
                                            await t(interaction, 'common_error_vote_locked_button', {
                                                botName: interaction.client.user.username,
                                            })
                                        )
                                        .setStyle(ButtonStyle.Link)
                                        .setURL(`https://top.gg/bot/${kythia.bot.clientId}/vote`)
                                )
                            );
                            container.addSeparatorComponents(
                                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                            );
                            container.addTextDisplayComponents(
                                new TextDisplayBuilder().setContent(await t(interaction, 'common_container_footer'))
                            );
                            return interaction.reply({
                                components: [container],
                                ephemeral: true,
                                flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
                            });
                        }
                    }

                    const cooldownDuration = command.cooldown ?? kythia.bot.globalCommandCooldown ?? 0;

                    if (cooldownDuration > 0 && !isOwner(interaction.user.id)) {
                        const { cooldowns } = this.client;

                        if (!cooldowns.has(command.name)) {
                            cooldowns.set(command.name, new Collection());
                        }

                        const now = Date.now();
                        const timestamps = cooldowns.get(command.name);
                        const cooldownAmount = cooldownDuration * 1000;

                        if (timestamps.has(interaction.user.id)) {
                            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

                            if (now < expirationTime) {
                                const timeLeft = (expirationTime - now) / 1000;
                                const reply = await t(interaction, 'common_error_cooldown', { time: timeLeft.toFixed(1) });
                                return interaction.reply({ content: reply, ephemeral: true });
                            }
                        }

                        timestamps.set(interaction.user.id, now);
                        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
                    }

                    await command.execute(interaction, this.container);
                } else if (interaction.isAutocomplete()) {
                    let commandKey = interaction.commandName;
                    const group = interaction.options.getSubcommandGroup(false);
                    const subcommand = interaction.options.getSubcommand(false);

                    if (group) commandKey = `${commandKey} ${group} ${subcommand}`;
                    else if (subcommand) commandKey = `${commandKey} ${subcommand}`;

                    let handler = this.autocompleteHandlers.get(commandKey);

                    if (!handler && (subcommand || group)) {
                        handler = this.autocompleteHandlers.get(interaction.commandName);
                    }

                    if (handler) {
                        try {
                            await handler(interaction, this.container);
                        } catch (err) {
                            logger.error(`Error in autocomplete handler for ${commandKey}:`, err);
                            try {
                                await interaction.respond([]);
                            } catch (e) {}
                        }
                    } else {
                        try {
                            await interaction.respond([]);
                        } catch (e) {}
                    }
                } else if (interaction.isButton()) {
                    const handler = this.buttonHandlers.get(interaction.customId.split('_')[0]);
                    if (handler) await handler(interaction, this.container);
                } else if (interaction.isModalSubmit()) {
                    // Handle both | and : separators for modal custom IDs
                    const customIdPrefix = interaction.customId.includes('|')
                        ? interaction.customId.split('|')[0]
                        : interaction.customId.split(':')[0];
                    logger.info('Modal submit - customId:', interaction.customId, 'prefix:', customIdPrefix);
                    const handler = this.modalHandlers.get(customIdPrefix);
                    logger.info('Modal handler found:', !!handler);
                    if (handler) await handler(interaction, this.container);
                } else if (interaction.isUserContextMenuCommand() || interaction.isMessageContextMenuCommand()) {
                    const command = this.client.commands.get(interaction.commandName);
                    if (!command) return;

                    if (command.guildOnly && !interaction.inGuild()) {
                        return interaction.reply({ content: await t(interaction, 'common_error_guild_only'), ephemeral: true });
                    }
                    if (command.ownerOnly && !isOwner(interaction.user.id)) {
                        return interaction.reply({ content: await t(interaction, 'common_error_not_owner'), ephemeral: true });
                    }
                    if (command.teamOnly && !isOwner(interaction.user.id)) {
                        const isTeam = await checkIsTeam(interaction.user);
                        if (!isTeam) return interaction.reply({ content: await t(interaction, 'common_error_not_team'), ephemeral: true });
                    }
                    if (command.permissions && interaction.inGuild()) {
                        const missingPerms = interaction.member.permissions.missing(command.permissions);
                        if (missingPerms.length > 0)
                            return interaction.reply({
                                content: await t(interaction, 'common_error_user_missing_perms', { perms: formatPerms(missingPerms) }),
                                ephemeral: true,
                            });
                    }
                    if (command.botPermissions && interaction.inGuild()) {
                        const missingPerms = interaction.guild.members.me.permissions.missing(command.botPermissions);
                        if (missingPerms.length > 0)
                            return interaction.reply({
                                content: await t(interaction, 'common_error_bot_missing_perms', { perms: formatPerms(missingPerms) }),
                                ephemeral: true,
                            });
                    }
                    if (command.isInMainGuild && !isOwner(interaction.user.id)) {
                        const mainGuild = this.client.guilds.cache.get(kythia.bot.mainGuildId);
                        if (!mainGuild) {
                            logger.error(
                                `❌ [isInMainGuild Check] Error: Bot is not a member of the main guild specified in config: ${kythia.bot.mainGuildId}`
                            );
                        }
                        try {
                            await mainGuild.members.fetch(interaction.user.id);
                        } catch (error) {
                            const container = new ContainerBuilder().setAccentColor(
                                convertColor(kythia.bot.color, { from: 'hex', to: 'decimal' })
                            );
                            container.addTextDisplayComponents(
                                new TextDisplayBuilder().setContent(
                                    await t(interaction, 'common_error_not_in_main_guild', { name: mainGuild.name })
                                )
                            );
                            container.addSeparatorComponents(
                                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                            );
                            container.addActionRowComponents(
                                new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                        .setLabel(await t(interaction, 'common_error_not_in_main_guild_button_join'))
                                        .setStyle(ButtonStyle.Link)
                                        .setURL(kythia.settings.supportServer)
                                )
                            );
                            container.addTextDisplayComponents(
                                new TextDisplayBuilder().setContent(
                                    await t(interaction, 'common_container_footer', { username: interaction.client.user.username })
                                )
                            );
                            return interaction.reply({
                                components: [container],
                                flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
                            });
                        }
                    }
                    if (command.voteLocked && !isOwner(interaction.user.id)) {
                        const voter = await KythiaVoter.getCache({ userId: interaction.user.id });

                        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

                        if (!voter || voter.votedAt < twelveHoursAgo) {
                            const container = new ContainerBuilder().setAccentColor(
                                convertColor(kythia.bot.color, { from: 'hex', to: 'decimal' })
                            );
                            container.addTextDisplayComponents(
                                new TextDisplayBuilder().setContent(await t(interaction, 'common_error_vote_locked'))
                            );
                            container.addSeparatorComponents(
                                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                            );
                            container.addActionRowComponents(
                                new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                        .setLabel(
                                            await t(interaction, 'common_error_vote_locked_button', {
                                                botName: interaction.client.user.username,
                                            })
                                        )
                                        .setStyle(ButtonStyle.Link)
                                        .setURL(`https://top.gg/bot/${kythia.bot.clientId}/vote`)
                                )
                            );
                            container.addSeparatorComponents(
                                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                            );
                            container.addTextDisplayComponents(
                                new TextDisplayBuilder().setContent(await t(interaction, 'common_container_footer'))
                            );
                            return interaction.reply({
                                components: [container],
                                ephemeral: true,
                                flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
                            });
                        }
                    }

                    await command.execute(interaction, this.container);
                }
            } catch (error) {
                logger.error(`Error in interaction handler for ${interaction.user.tag}:`, error);

                if (kythia.sentry.dsn) {
                    Sentry.withScope((scope) => {
                        scope.setUser({ id: interaction.user.id, username: interaction.user.tag });
                        scope.setTag('command', interaction.commandName);
                        if (interaction.guild) {
                            scope.setContext('guild', {
                                id: interaction.guild.id,
                                name: interaction.guild.name,
                            });
                        }
                        Sentry.captureException(error);
                    });
                }

                const ownerFirstId = kythia.owner.ids.split(',')[0].trim();
                const components = [
                    new ContainerBuilder()
                        .setAccentColor(convertColor('Red', { from: 'discord', to: 'decimal' }))
                        .addTextDisplayComponents(new TextDisplayBuilder().setContent(await t(interaction, 'common_error_generic')))
                        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
                        .addActionRowComponents(
                            new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setStyle(ButtonStyle.Link)
                                    .setLabel(await t(interaction, 'common_error_button_join_support_server'))
                                    .setURL(kythia.settings.supportServer),
                                new ButtonBuilder()
                                    .setStyle(ButtonStyle.Link)
                                    .setLabel(await t(interaction, 'common_error_button_contact_owner'))
                                    .setURL(`discord://-/users/${ownerFirstId}`)
                            )
                        ),
                ];
                try {
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({
                            components,
                            flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
                            ephemeral: true,
                        });
                    } else {
                        await interaction.reply({
                            components,
                            flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
                            ephemeral: true,
                        });
                    }
                } catch (e) {
                    logger.error('Failed to send interaction error message:', e);
                }

                try {
                    if (kythia.api.webhookErrorLogs && kythia.settings.webhookErrorLogs === true) {
                        const webhookClient = new WebhookClient({ url: kythia.api.webhookErrorLogs });
                        const errorEmbed = new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(`## ❌ Error at ${interaction.user.tag}\n` + `\`\`\`${error.stack}\`\`\``)
                            .setFooter({ text: interaction.guild ? `Error from server ${interaction.guild.name}` : 'Error from DM' })
                            .setTimestamp();
                        await webhookClient.send({ embeds: [errorEmbed] });
                    }
                } catch (webhookErr) {
                    logger.error('Error sending interaction error webhook:', webhookErr);
                }
            }
        });

        this.client.on(Events.AutoModerationActionExecution, async (execution) => {
            try {
                const guildId = execution.guild.id;
                const ruleName = execution.ruleTriggerType.toString();

                const settings = await ServerSetting.getCache({ guildId: guildId });

                const locale = execution.guild.preferredLocale;

                if (!settings || !settings.modLogChannelId) {
                    return;
                }

                const logChannelId = settings.modLogChannelId;
                const logChannel = await execution.guild.channels.fetch(logChannelId).catch(() => null);

                if (logChannel) {
                    const embed = new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(
                            await t(
                                null,
                                'common_automod',
                                {
                                    ruleName: ruleName,
                                },
                                locale
                            )
                        )
                        .addFields(
                            {
                                name: await t(null, 'common_automod_field_user', {}, locale),
                                value: `${execution.user.tag} (${execution.userId})`,
                                inline: true,
                            },
                            { name: await t(null, 'common_automod_field_rule_trigger', {}, locale), value: `\`${ruleName}\``, inline: true }
                        )
                        .setFooter({
                            text: await t(
                                null,
                                'common_embed_footer',
                                {
                                    username: execution.guild.client.user.username,
                                },
                                locale
                            ),
                        })
                        .setTimestamp();

                    await logChannel.send({ embeds: [embed] });
                }
            } catch (err) {
                logger.error(`[AutoMod Logger] Error during execution for ${execution.guild.name}:`, err);
            }
        });
    }

    /**
     * 🧮 Count the total number of executable commands, including subcommands.
     * @param {Array} commandJsonArray - Array of command data to be deployed.
     * @returns {number} Total number of commands.
     */
    _countTotalExecutableCommands(commandJsonArray) {
        let total = 0;
        for (const command of commandJsonArray) {
            const hasSubcommands = command.options?.some((opt) => opt.type === 1 || opt.type === 2);

            if (!hasSubcommands) {
                total += 1;
            } else {
                for (const option of command.options) {
                    if (option.type === 1) {
                        total += 1;
                    } else if (option.type === 2) {
                        total += option.options?.length || 0;
                    }
                }
            }
        }
        return total;
    }

    /**
     * 🚀 Deploy Commands to Discord
     * Deploys all registered slash commands to Discord using the REST API.
     * @param {Array} commands - Array of command data to deploy.
     */
    async _deployCommands(commands) {
        if (!commands || commands.length === 0) {
            logger.info('No commands to deploy.');
            return;
        }
        try {
            const { slash, user, message } = this._getCommandCounts(commands);
            const clientId = kythia.bot.clientId;
            const devGuildId = kythia.bot.devGuildId;

            let deployType = '';
            if (kythia.env == 'dev' || kythia.env == 'development') {
                if (!devGuildId) {
                    logger.warn('⚠️ devGuildId not set in config. Skipping guild command deployment.');
                    return;
                }
                logger.info(`🟠 Deploying to GUILD ${devGuildId}...`);
                await this.rest.put(Routes.applicationGuildCommands(clientId, devGuildId), { body: commands });
                logger.info('✅ Guild commands deployed instantly!');
                deployType = `Guild (${devGuildId})`;
            } else {
                logger.info(`🟢 Deploying globally...`);
                await this.rest.put(Routes.applicationCommands(clientId), { body: commands });
                logger.info('✅ Global commands deployed successfully!');
                if (devGuildId) {
                    logger.info(`🧹 Clearing old commands from dev guild: ${devGuildId}...`);
                    try {
                        await this.rest.put(Routes.applicationGuildCommands(clientId, devGuildId), { body: [] });
                        logger.info('✅ Dev guild commands cleared successfully.');
                    } catch (err) {
                        logger.warn(`⚠️ Could not clear dev guild commands (maybe it was already clean): ${err.message}`);
                    }
                }
                deployType = 'Global';
            }

            logger.info(`⭕ All Slash Commands: ${commands.length}`);
            logger.info(`⭕ Top Level Slash Commands: ${slash}`);
            logger.info(`⭕ User Context Menu: ${user}`);
            logger.info(`⭕ Message Context Menu: ${message}`);
            logger.info('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬');
        } catch (err) {
            logger.error('❌ Failed to deploy slash commands:', err);
        }
    }

    /**
     * 🕵️‍♂️ [GLOBAL PATCH] Overrides global interval functions to track all active intervals.
     * This allows for a truly generic and scalable graceful shutdown of all timed tasks.
     */
    _initializeGlobalIntervalTracker() {
        if (!this._activeIntervals) this._activeIntervals = new Set();

        const botInstance = this;
        const originalSetInterval = global.setInterval;
        const originalClearInterval = global.clearInterval;

        global.setInterval = function (...args) {
            const intervalId = originalSetInterval.apply(this, args);

            botInstance._activeIntervals.add(intervalId);
            return intervalId;
        };

        global.clearInterval = function (intervalId) {
            originalClearInterval.apply(this, [intervalId]);

            botInstance._activeIntervals.delete(intervalId);
        };

        logger.info('✅ Global setInterval/clearInterval has been patched for tracking.');
    }

    /**
     * 🛑 [FINAL ARCHITECTURE v5] Manages ALL graceful shutdown procedures.
     * This version patches the core message sending/editing methods to automatically
     * track ANY message with components, regardless of how its interactions are handled.
     */
    _shutdownCollectorsOnExit() {
        if (!this._messagesWithActiveCollectors) this._messagesWithActiveCollectors = new Set();

        if (!this._collectorPatched) {
            const origCreateCollector = require('discord.js').Message.prototype.createMessageComponentCollector;
            const botInstance = this;

            require('discord.js').Message.prototype.createMessageComponentCollector = function (...args) {
                const collector = origCreateCollector.apply(this, args);
                const message = this;

                if (botInstance._messagesWithActiveCollectors) {
                    botInstance._messagesWithActiveCollectors.add(message);
                }

                collector.once('end', () => {
                    if (botInstance._messagesWithActiveCollectors) {
                        botInstance._messagesWithActiveCollectors.delete(message);
                    }
                });

                return collector;
            };
            this._collectorPatched = true;
            logger.info('✅ Corrected collector-based component tracking has been patched.');
        }

        if (!this._cleanupAttached) {
            const cleanupAndFlush = async (callback) => {
                logger.info('🛑 Graceful shutdown initiated...');

                if (this._activeIntervals && this._activeIntervals.size > 0) {
                    logger.info(`🛑 Halting ${this._activeIntervals.size} active global intervals...`);
                    for (const intervalId of this._activeIntervals) {
                        clearInterval(intervalId);
                    }
                }

                const messagesToProcess = this._messagesWithActiveCollectors;

                if (messagesToProcess && messagesToProcess.size > 0) {
                    logger.info(`🛑 Disabling components on up to ${messagesToProcess.size} messages.`);
                    const editPromises = [];

                    function disableRecursively(components) {
                        return components.map((comp) => {
                            if (comp.components && Array.isArray(comp.components)) {
                                comp.components = disableRecursively(comp.components);
                            }

                            if (comp.type === 2 || comp.type === 3 || comp.type >= 5) {
                                return { ...comp, disabled: true };
                            }
                            return comp;
                        });
                    }

                    for (const msg of messagesToProcess) {
                        if (!msg.editable || !msg.components || msg.components.length === 0) continue;
                        try {
                            const rawComponents = msg.components.map((c) => c.toJSON());
                            const disabledComponents = disableRecursively(rawComponents);
                            editPromises.push(msg.edit({ components: disabledComponents }).catch(() => {}));
                        } catch (e) {
                            /* Abaikan */
                        }
                    }
                    await Promise.allSettled(editPromises);
                }
                logger.info('✅ Component cleanup complete.');

                logger.info('🚰 Flushing remaining logs...');
                logger.on('finish', () => {
                    console.log('⏳ Logger has flushed. Kythia is now safely shutting down.');
                    if (callback) callback();
                });
                logger.end();
                setTimeout(() => {
                    console.log('⏳ Logger flush timeout. Forcing exit.');
                    if (callback) callback();
                }, 4000);
            };

            exitHook(cleanupAndFlush);
            process.on('unhandledRejection', (error) => {
                logger.error('‼️ UNHANDLED PROMISE REJECTION:', error);
            });
            process.on('uncaughtException', (error) => {
                logger.error('‼️ UNCAUGHT EXCEPTION! Bot will shutdown.', error);
                process.exit(1);
            });

            this._cleanupAttached = true;
            logger.info('🛡️  Graceful shutdown and error handlers are now active.');
        }
    }
    /**
     * Menghitung jumlah top-level command berdasarkan tipenya dari data JSON mentah.
     * @param {Array} commandJsonArray - Array command data yang akan di-deploy.
     * @returns {object} - Objek berisi jumlah { slash, user, message }.
     * @private
     */
    _getCommandCounts(commandJsonArray) {
        const counts = { slash: 0, user: 0, message: 0 };

        if (!Array.isArray(commandJsonArray)) {
            logger.warn('commandJsonArray is not iterable. Returning zero counts.');
            return counts;
        }

        for (const cmd of commandJsonArray) {
            switch (cmd?.type) {
                case 1:
                case undefined:
                    counts.slash++;
                    break;
                case 2:
                    counts.user++;
                    break;
                case 3:
                    counts.message++;
                    break;
            }
        }
        return counts;
    }
    /**
     * [BARU] Method untuk addon "menitipkan" tugas.
     * @param {function} callback - Fungsi yang akan dijalankan saat client ready.
     */
    addReadyHook(callback) {
        this.readyHooks.push(callback);
    }
    /**
     * 🚦 Initialize Master Event Handlers
     * Creates a single listener for each event type that then executes all
     * registered addon handlers in their prioritized order.
     */
    _initializeEventHandlers() {
        for (const [eventName, handlers] of this.eventHandlers.entries()) {
            this.client.on(eventName, async (...args) => {
                for (const handler of handlers) {
                    try {
                        const stopPropagation = await handler(this, ...args);

                        if (stopPropagation === true) {
                            break;
                        }
                    } catch (error) {
                        logger.error(`Error executing event handler for [${eventName}]:`, error);
                    }
                }
            });
        }
    }
    /**
     * 🌸 Start the Kythia
     * Loads locales, synchronizes the database, loads all addons, initializes interaction handlers,
     * deploys commands, and logs in the Discord client.
     * Handles startup errors and exits on failure.
     */
    async start() {
        const version = require('../package.json').version;
        const clc = require('cli-color');
        const figletText = (text, opts) =>
            new Promise((resolve, reject) => {
                figlet.text(text, opts, (err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            });

        try {
            // Render figlet text (no border)
            const data = await figletText('KYTHIA', {
                font: 'ANSI Shadow',
                horizontalLayout: 'full',
                verticalLayout: 'full',
            });

            // Info lines (inside border)
            const infoLines = [
                clc.cyan('Created by kenndeclouv'),
                clc.cyan('Discord Support: ') + clc.underline('https://dsc.gg/kythia'),
                clc.cyan('Official Documentation: ') + clc.underline('https://kythia.my.id/commands'),
                '',
                clc.cyanBright(`Kythia version: ${version}`),
                '',
                clc.yellowBright('Respect my work by not removing the credit'),
            ];

            // Calculate border width based on the longest info line
            const rawInfoLines = infoLines.map((line) => clc.strip(line));
            const infoMaxLen = Math.max(...rawInfoLines.map((l) => l.length));
            const pad = 8;
            const borderWidth = infoMaxLen + pad * 2;
            const borderChar = clc.cyanBright('═');
            const sideChar = clc.cyanBright('║');
            const topBorder = clc.cyanBright('╔' + borderChar.repeat(borderWidth) + '╗');
            const bottomBorder = clc.cyanBright('╚' + borderChar.repeat(borderWidth) + '╝');
            const emptyLine = sideChar + ' '.repeat(borderWidth) + sideChar;

            // Center figlet lines inside the border
            const figletLines = data.split('\n');
            const centeredFigletInBorder = figletLines
                .map((line) => {
                    const rawLen = clc.strip(line).length;
                    const spaces = ' '.repeat(Math.max(0, Math.floor((borderWidth - rawLen) / 2)));
                    return sideChar + spaces + clc.cyanBright(line) + ' '.repeat(borderWidth - spaces.length - rawLen) + sideChar;
                })
                .join('\n');

            // Center info lines inside the border
            const centeredInfo = infoLines
                .map((line, idx) => {
                    const raw = rawInfoLines[idx];
                    const spaces = ' '.repeat(Math.floor((borderWidth - raw.length) / 2));
                    return sideChar + spaces + line + ' '.repeat(borderWidth - spaces.length - raw.length) + sideChar;
                })
                .join('\n');

            // Print border with figlet centered inside, then info box
            console.log('\n' + topBorder);
            console.log(emptyLine);
            console.log(centeredFigletInBorder);
            console.log(emptyLine);
            console.log(centeredInfo);
            console.log(emptyLine);
            console.log(bottomBorder + '\n');
        } catch (err) {
            logger.error('❌ Failed to render figlet banner:', err);
        }

        logger.info('🚀 Starting kythia...');
        if (kythia.sentry.dsn) {
            Sentry.init({
                dsn: kythia.sentry.dsn,
                tracesSampleRate: 1.0,
                profilesSampleRate: 1.0,
            });
            logger.info('✔️  Sentry Error Tracking is ACTIVE');
        } else {
            logger.warn('🟠 Sentry DSN not found in config. Error tracking is INACTIVE.');
        }
        this._checkRequiredConfig();
        try {
            const shouldDeploy = process.argv.includes('--deploy');
            logger.info('▬▬▬▬▬▬▬▬▬▬▬[ Load Locales & Fonts ]▬▬▬▬▬▬▬▬▬▬▬');
            loadLocales();
            loadFonts();
            logger.info('▬▬▬▬▬▬▬▬▬▬▬▬▬▬[ Load KythiaORM ]▬▬▬▬▬▬▬▬▬▬▬▬▬▬');
            KythiaModel.initialize(kythia.db.redis);
            const sequelize = await KythiaORM();
            this.container.sequelize = sequelize;
            this.kythiaManager = new KythiaManager(ServerSetting);
            this.container.kythiaManager = this.kythiaManager;
            logger.info('▬▬▬▬▬▬▬▬▬▬▬▬▬▬[ Kythia Manager ]▬▬▬▬▬▬▬▬▬▬▬▬▬▬');
            await this.kythiaManager.warmCache();
            logger.info('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬[ Kythia Addons ]▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬');
            const allCommands = await this._loadAddons();
            this._initializeEventHandlers();
            this._initializeInteractionHandler();
            logger.info('▬▬▬▬▬▬▬▬▬▬▬▬▬[ Deploy Commands ]▬▬▬▬▬▬▬▬▬▬▬▬▬');
            if (shouldDeploy) {
                await this._deployCommands(allCommands);
            } else {
                logger.info('⏭️  Skipping command deployment. Use --deploy flag to force update.');
            }
            this._initializeGlobalIntervalTracker();
            this._shutdownCollectorsOnExit();
            logger.info('▬▬▬▬▬▬▬▬▬▬▬[ Systems Initializing ]▬▬▬▬▬▬▬▬▬▬▬▬');
            const auditLogger = new AuditLogger(this);
            auditLogger.initialize();
            this.client.once('clientReady', async () => {
                logger.info(`🌸 Logged in as ${this.client.user.tag}`);

                logger.info(`🚀 Executing ${this.readyHooks.length} ready hooks...`);
                for (const hook of this.readyHooks) {
                    try {
                        hook(this.client);
                    } catch (error) {
                        logger.error('Failed to execute a ready hook:', error);
                    }
                }
            });

            await this.client.login(kythia.bot.token);
        } catch (error) {
            logger.error('❌ Kythia initialization failed:', error);
            if (kythia.sentry.dsn) {
                Sentry.captureException(error);
            }
            process.exit(1);
        }
    }
}

module.exports = Kythia;
