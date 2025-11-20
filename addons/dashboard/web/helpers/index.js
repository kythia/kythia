/**
 * @namespace: addons/dashboard/web/helpers/index.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { ApplicationCommandOptionType, ApplicationCommandType, PermissionsBitField } = require('discord.js');
const ServerSetting = require('@coreModels/ServerSetting');
const KythiaVoter = require('@coreModels/KythiaVoter');
const { marked } = require('marked');
const logger = require('@coreHelpers/logger');
const path = require('path');
const fs = require('fs');
const { ensureArray } = require('./settings');

function getOptionType(type) {
    switch (type) {
        case ApplicationCommandOptionType.String:
            return 'Text';
        case ApplicationCommandOptionType.Integer:
            return 'Integer';
        case ApplicationCommandOptionType.Number:
            return 'Number';
        case ApplicationCommandOptionType.Boolean:
            return 'True/False';
        case ApplicationCommandOptionType.User:
            return 'User';
        case ApplicationCommandOptionType.Channel:
            return 'Channel';
        case ApplicationCommandOptionType.Role:
            return 'Role';
        case ApplicationCommandOptionType.Mentionable:
            return 'Mention';
        case ApplicationCommandOptionType.Attachment:
            return 'Attachment';
        default:
            return 'Unknown';
    }
}

function formatChoices(choices) {
    if (!choices) return null;
    return choices.map((c) => `\`${c.name}\` (\`${c.value}\`)`).join(', ');
}

function clearRequireCache(filePath) {
    try {
        delete require.cache[require.resolve(filePath)];
    } catch (e) {}
}

function parseChangelog(markdownContent) {
    const changelogs = [];

    const versions = markdownContent.split(/\n(?=###\s(?:\[[^\]]+\]\([^)]+\)|[\w.-]+)\s*\((\d{4}-\d{2}-\d{2})\))/);

    const startIndex = versions[0].startsWith('###') ? 0 : 1;

    for (let i = startIndex; i < versions.length; i++) {
        const block = versions[i];
        if (!block.trim()) continue;

        const lines = block.split('\n');

        const headerLine = lines
            .shift()
            .replace(/^###\s*/, '')
            .trim();

        let version, date;

        let match = headerLine.match(/^\[([^\]]+)\]\([^)]+\)\s*\((\d{4}-\d{2}-\d{2})\)$/);
        if (match) {
            version = match[1];
            date = match[2];
        } else {
            match = headerLine.match(/^([\w.-]+)\s*\((\d{4}-\d{2}-\d{2})\)$/);
            if (match) {
                version = match[1];
                date = match[2];
            }
        }

        if (version && date) {
            const contentMarkdown = lines.join('\n').trim();
            if (contentMarkdown) {
                const contentHtml = marked.parse(contentMarkdown);
                changelogs.push({
                    version,
                    date,
                    html: contentHtml,
                });
            }
        }
    }
    return changelogs;
}

function buildCategoryMap() {
    const categoryMap = {};
    const rootAddonsDir = path.join(__dirname, '..', '..', '..');
    const addonDirs = fs.readdirSync(rootAddonsDir, { withFileTypes: true }).filter((dirent) => dirent.isDirectory());

    for (const addon of addonDirs) {
        const commandsPath = path.join(rootAddonsDir, addon.name, 'commands');
        if (!fs.existsSync(commandsPath)) continue;

        const processFile = (filePath, categoryName) => {
            try {
                clearRequireCache(filePath);
                const command = require(filePath);
                let commandNames = [];

                if (command.slashCommand) {
                    const name = command.slashCommand.name;
                    if (name) commandNames.push(name);
                }

                if (command.contextMenuCommand) {
                    const name = command.contextMenuCommand.name;
                    if (name) commandNames.push(name);
                }

                if (command.data) {
                    const name = command.data.name;
                    if (name) commandNames.push(name);
                }

                if (typeof command.name === 'string') {
                    commandNames.push(command.name);
                }

                [...new Set(commandNames.filter(Boolean))].forEach((cmdName) => {
                    categoryMap[cmdName] = categoryName;
                });
            } catch (e) {
                logger.error(`Failed to read command name from file: ${filePath}`, e.message);
            }
        };

        if (addon.name === 'core') {
            const coreCategories = fs.readdirSync(commandsPath, { withFileTypes: true }).filter((d) => d.isDirectory());
            for (const category of coreCategories) {
                const categoryPath = path.join(commandsPath, category.name);
                fs.readdirSync(categoryPath)
                    .filter((f) => f.endsWith('.js'))
                    .forEach((file) => {
                        processFile(path.join(categoryPath, file), category.name);
                    });
            }
        } else {
            const categoryName = addon.name;
            fs.readdirSync(commandsPath)
                .filter((f) => f.endsWith('.js'))
                .forEach((file) => {
                    processFile(path.join(commandsPath, file), categoryName);
                });
        }
    }
    return categoryMap;
}

const categoryMap = buildCategoryMap();

async function getCommandsData(client) {
    const allCommands = [];
    const categories = new Set();
    let totalCommandCount = 0;
    const processedCommands = new Set();

    client.commands.forEach((command) => {
        if (command.ownerOnly === true) {
            return;
        }

        // Fix: Avoid "data" dummy or boilerplate commands by validating name and description
        const slashData = command.slashCommand || command.data;
        if (
            slashData &&
            typeof slashData.name === 'string' &&
            // Exclude generic "data" command
            slashData.name.toLowerCase() !== 'data' &&
            // Must have a real description (not undefined/empty/boilerplate)
            slashData.description &&
            slashData.description.trim() &&
            !/^no description( provided)?\.?$/i.test(slashData.description.trim())
        ) {
            const commandJSON = typeof slashData.toJSON === 'function' ? slashData.toJSON() : slashData;

            const uniqueKey = `slash-${commandJSON.name}`;

            // Gather aliases for this command, supports command.aliases as array or string
            let aliases = [];
            if (Array.isArray(command.aliases)) {
                aliases = command.aliases.filter(alias => typeof alias === "string" && alias.trim());
            } else if (typeof command.aliases === "string" && command.aliases.trim()) {
                aliases = [command.aliases.trim()];
            }

            if (!processedCommands.has(uniqueKey)) {
                processedCommands.add(uniqueKey);

                const categoryName = categoryMap[commandJSON.name] || 'uncategorized';
                const parsedCommand = {
                    name: commandJSON.name,
                    description: commandJSON.description || 'No description provided.',
                    category: categoryName,
                    options: [],
                    subcommands: [],
                    aliases: aliases,
                    type: 'slash',
                    isContextMenu: false,
                };

                if (Array.isArray(commandJSON.options) && commandJSON.options.length > 0) {
                    const subcommands = commandJSON.options.filter(
                        (opt) =>
                            opt.type === ApplicationCommandOptionType.Subcommand ||
                            opt.type === ApplicationCommandOptionType.SubcommandGroup
                    );
                    const regularOptions = commandJSON.options.filter(
                        (opt) =>
                            opt.type !== ApplicationCommandOptionType.Subcommand &&
                            opt.type !== ApplicationCommandOptionType.SubcommandGroup
                    );

                    if (subcommands.length > 0) {
                        subcommands.forEach((sub) => {
                            if (sub.type === ApplicationCommandOptionType.SubcommandGroup) {
                                totalCommandCount += sub.options?.length || 0;
                                (sub.options || []).forEach((subInGroup) => {
                                    // sub-aliases not common, but theoretically possible. Add if present.
                                    let subAliases = [];
                                    if (Array.isArray(subInGroup.aliases)) {
                                        subAliases = subInGroup.aliases.filter(alias => typeof alias === "string" && alias.trim());
                                    } else if (typeof subInGroup.aliases === "string" && subInGroup.aliases.trim()) {
                                        subAliases = [subInGroup.aliases.trim()];
                                    }
                                    parsedCommand.subcommands.push({
                                        name: `${sub.name} ${subInGroup.name}`,
                                        description: subInGroup.description,
                                        options: (subInGroup.options || []).map((opt) => ({
                                            name: opt.name,
                                            description: opt.description,
                                            type: getOptionType(opt.type),
                                            required: opt.required ?? false,
                                            choices: formatChoices(opt.choices),
                                        })),
                                        aliases: subAliases,
                                    });
                                });
                            } else {
                                totalCommandCount += 1;
                                let subAliases = [];
                                if (Array.isArray(sub.aliases)) {
                                    subAliases = sub.aliases.filter(alias => typeof alias === "string" && alias.trim());
                                } else if (typeof sub.aliases === "string" && sub.aliases.trim()) {
                                    subAliases = [sub.aliases.trim()];
                                }
                                parsedCommand.subcommands.push({
                                    name: sub.name,
                                    description: sub.description,
                                    options: (sub.options || []).map((opt) => ({
                                        name: opt.name,
                                        description: opt.description,
                                        type: getOptionType(opt.type),
                                        required: opt.required ?? false,
                                        choices: formatChoices(opt.choices),
                                    })),
                                    aliases: subAliases,
                                });
                            }
                        });
                    } else {
                        totalCommandCount += 1;
                    }

                    if (regularOptions.length > 0) {
                        parsedCommand.options = regularOptions.map((opt) => ({
                            name: opt.name,
                            description: opt.description,
                            type: getOptionType(opt.type),
                            required: opt.required ?? false,
                            choices: formatChoices(opt.choices),
                        }));
                    }
                } else {
                    totalCommandCount += 1;
                }

                allCommands.push(parsedCommand);
                categories.add(categoryName);
            }
        }

        // Context commands must have a valid name and should not be data
        if (
            command.contextMenuCommand &&
            typeof command.contextMenuCommand.name === 'string' &&
            command.contextMenuCommand.name.toLowerCase() !== 'data'
        ) {
            const commandJSON =
                typeof command.contextMenuCommand.toJSON === 'function' ? command.contextMenuCommand.toJSON() : command.contextMenuCommand;
            const uniqueKey = `context-${commandJSON.name}`;

            if (!processedCommands.has(uniqueKey)) {
                processedCommands.add(uniqueKey);

                const categoryName = categoryMap[commandJSON.name] || 'uncategorized';

                let description;

                if (typeof command.contextMenuDescription === 'string' && command.contextMenuDescription.trim()) {
                    description = command.contextMenuDescription.trim();
                } else if (
                    command.slashCommand &&
                    typeof command.slashCommand.description === 'string' &&
                    command.slashCommand.description &&
                    command.slashCommand.description.trim() &&
                    !/^no description( provided)?\.?$/i.test(command.slashCommand.description.trim())
                ) {
                    description = command.slashCommand.description.trim();
                } else {
                    if (commandJSON.type === ApplicationCommandType.Message) {
                        description = 'Right-click on a message to use this command.';
                    } else {
                        description = 'Right-click on a user to use this command.';
                    }
                }

                // Gather aliases for contextMenuCommand too, though rare
                let aliases = [];
                if (Array.isArray(command.aliases)) {
                    aliases = command.aliases.filter(alias => typeof alias === "string" && alias.trim());
                } else if (typeof command.aliases === "string" && command.aliases.trim()) {
                    aliases = [command.aliases.trim()];
                }

                // Only include if has a non-empty description
                if (description && description.trim()) {
                    const parsedCommand = {
                        name: commandJSON.name,
                        description: description,
                        category: categoryName,
                        options: [],
                        subcommands: [],
                        aliases: aliases,
                        type: commandJSON.type === ApplicationCommandType.User ? 'user' : 'message',
                        isContextMenu: true,
                    };

                    allCommands.push(parsedCommand);
                    categories.add(categoryName);
                    totalCommandCount += 1;
                }
            }
        }
    });

    return {
        commands: allCommands.sort((a, b) => a.name.localeCompare(b.name)),
        categories: Array.from(categories).sort(),
        totalCommands: totalCommandCount,
    };
}

function isAuthorized(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/');
}

async function checkServerAccess(req, res, next) {
    try {
        const guildId = req.params.guildId;
        const botClient = req.app.locals.bot;
        const guild = botClient.guilds.cache.get(guildId);
        if (!guild) {
            return res.status(404).render('error', {
                title: 'Server Tidak Ditemukan',
                message: 'Bot tidak berada di server ini atau ID server tidak valid.',
                page: '/',
                currentPage: '',
                user: req.user || null,
                guild: null,
            });
        }
        const member = await guild.members.fetch(req.user.id).catch(() => null);
        if (!member || !member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return res.status(403).render('error', {
                title: 'Akses Ditolak',
                message: 'Anda tidak memiliki izin "Manage Server" untuk mengakses halaman ini.',
                page: '/',
                currentPage: '',
                user: req.user || null,
                guild: null,
            });
        }
        req.guild = guild;

        let settings = await ServerSetting.getCache({ guildId: guild.id });
        if (!settings) {
            await ServerSetting.create({ guildId: guild.id, guildName: guild.name });
            settings = await ServerSetting.getCache({ guildId: guild.id });
        }
        if (settings && typeof settings.saveAndUpdateCache === 'function') {
            const fieldsToEnsureArray = [
                'whitelist',
                'serverStats',
                'roleRewards',
                'aiChannelIds',
                'badwords',
                'badwordWhitelist',
                'ignoredChannels',
                'streakRoleRewards',
            ];

            for (const field of fieldsToEnsureArray) {
                if (settings.hasOwnProperty(field)) {
                    settings[field] = ensureArray(settings[field]);
                }
            }
        } else {
            logger.error(`Failed to get a valid settings instance for guild ${guildId}`);
            settings = {};
        }

        req.settings = settings;
        return next();
    } catch (error) {
        console.error('Error di middleware checkServerAccess:', error);

        return res.status(500).render('error', {
            title: 'Kesalahan Internal',
            message: 'Terjadi masalah saat memverifikasi akses server.',
            page: '/',
            currentPage: '',
            user: req.user || null,
            guild: null,
            settings: {},
        });
    }
}

function renderDash(res, viewName, opts = {}) {
    const defaults = {
        user: res.req.user,
        guilds: res.locals.guilds,
        botClientId: kythia.bot.clientId,
        botPermissions: '8',
        page: viewName === 'servers' ? '/' : viewName,
        guild: null,
        guildId: null,
        currentPage: '',
        stats: undefined,
        logs: undefined,
    };

    const viewsRoot = path.join(__dirname, '..', 'views');
    const pagesDir = path.join(viewsRoot, 'pages');
    const candidate = typeof viewName === 'string' ? path.join(pagesDir, `${viewName}.ejs`) : null;
    const viewExists = candidate ? fs.existsSync(candidate) : false;

    const safeViewName = viewExists ? viewName : null;

    const renderData = { ...defaults, ...opts, viewName: safeViewName, viewExists };
    res.render('layouts/dashMain', renderData);
}

module.exports = {
    getOptionType,
    formatChoices,
    clearRequireCache,
    parseChangelog,
    buildCategoryMap,
    getCommandsData,
    isAuthorized,
    checkServerAccess,
    renderDash,
};
