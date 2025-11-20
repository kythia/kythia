/**
 * @namespace: addons/core/helpers/translator.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

/**
 * @file src/utils/translator.js
 * @description Lightweight i18n helper to load language files and translate keys with
 * optional variables and fallback logic.
 * © 2025 kenndeclouv — v0.9.8-beta
 */
const ServerSetting = require('@coreModels/ServerSetting');
const { Collection } = require('discord.js');
const logger = require('./logger');
const path = require('path');
const fs = require('fs');

// Defensive fallback to 'en' when `kythia.bot.language` is not defined
let defaultLang = typeof kythia !== 'undefined' && kythia.bot && kythia.bot.language ? kythia.bot.language : 'en';

const guildLanguageCache = new Collection();
const locales = new Collection();

/**
 * Returns the loaded locales map.
 * @returns {Collection<string, object>} Locales keyed by language code.
 */
function getLocales() {
    return locales;
}

/**
 * Loads all JSON language files from `src/lang` into memory.
 */
function loadLocales() {
    const langDir = path.join(__dirname, '..', 'lang');

    try {
        if (!fs.existsSync(langDir)) {
            throw new Error(`🌐 Language directory not found in: ${langDir}`);
        }

        const langFiles = fs.readdirSync(langDir).filter((file) => file.endsWith('.json'));

        // Load all available languages
        for (const file of langFiles) {
            const lang = file.replace('.json', '');
            const filePath = path.join(langDir, file);

            const translations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            locales.set(lang, translations);
            logger.info(`🌐 Loaded Language: ${lang}`);
        }

        // Ensure defaultLang exists, otherwise use the first available language
        if (!locales.has(defaultLang)) {
            const availableLangs = Array.from(locales.keys());
            if (availableLangs.length > 0) {
                logger.warn(`⚠️  Default language '${defaultLang}' not found. Using '${availableLangs[0]}' instead.`);
                defaultLang = availableLangs[0];
            } else {
                throw new Error('❌ No language files found in lang directory.');
            }
        }
    } catch (err) {
        logger.error('❌ Error loading locales:', err);
    }
}

/**
 * Reads a nested key from an object using dot notation.
 * @param {object} obj - Source object.
 * @param {string} pathExpr - Path with dot notation (e.g., 'a.b.c').
 * @returns {*} The value at the path or undefined.
 */
function getNestedValue(obj, pathExpr) {
    if (!pathExpr) return undefined;
    return pathExpr.split('.').reduce((o, key) => (o && o[key] !== 'undefined' ? o[key] : undefined), obj);
}

/**
 * Translates a key using the current guild/user language with fallback to default.
 * Variables in the form `{name}` are interpolated from the `variables` object.
 *
 * @param {import('discord.js').Interaction | null} interaction - Current interaction (nullable).
 * @param {string} key - Translation key (supports dot notation).
 * @param {Record<string, string|number>} [variables={}] - Variables to interpolate.
 * @param {string|null} [forceLang=null] - Force a specific language code.
 * @returns {Promise<string>} Translated string or the key wrapped in brackets when missing.
 */
async function t(interaction, key, variables = {}, forceLang = null) {
    let lang = forceLang;

    if (!lang && interaction && interaction.guildId) {
        if (guildLanguageCache.has(interaction.guildId)) {
            lang = guildLanguageCache.get(interaction.guildId);
        } else {
            try {
                const setting = await ServerSetting.getCache({ guildId: interaction.guild.id });
                lang = setting && setting.language ? setting.language : defaultLang;
                guildLanguageCache.set(interaction.guildId, lang || defaultLang);
            } catch (error) {
                logger.error('Error getting language setting:', error);
                lang = defaultLang;
            }
        }
    } else if (!lang) {
        lang = defaultLang;
    }

    if (!lang) lang = defaultLang;

    let primaryLangFile = locales.get(lang);
    if (!primaryLangFile) {
        logger.warn(`⚠️  Language '${lang}' not found. Falling back to default language '${defaultLang}'.`);
        lang = defaultLang;
        primaryLangFile = locales.get(defaultLang);
    }
    const fallbackLangFile = locales.get(defaultLang);

    // Resolve translation from primary or fallback
    let translation = getNestedValue(primaryLangFile, key);
    if (translation === undefined && fallbackLangFile) {
        translation = getNestedValue(fallbackLangFile, key);
    }
    if (translation === undefined) {
        logger.error(`Translation key not found: ${key} in any language.`);
        return `[${key}]`;
    }

    for (const [variable, value] of Object.entries(variables)) {
        const regex = new RegExp(`{${variable}}`, 'g');
        translation = translation.replace(regex, String(value));
    }

    return translation;
}

module.exports = { t, loadLocales, getLocales };
