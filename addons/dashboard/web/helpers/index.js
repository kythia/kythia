const { ApplicationCommandOptionType, ApplicationCommandType, PermissionsBitField } = require('discord.js');
const ServerSetting = require('@coreModels/ServerSetting');
const KythiaVoter = require('@coreModels/KythiaVoter');
const { marked } = require('marked');
const logger = require('@utils/logger');
const path = require('path');
const fs = require('fs');
const { ensureArray } = require('./settings');

// Hybrid command loader for dashboard (supports both builder and hybrid style)
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
// Function to parse changelog content (THE DEFINITIVE FIX)
function parseChangelog(markdownContent) {
    const changelogs = [];

    // REGEX BARU UNTUK SPLIT:
    // Potong teksnya setiap kali nemu baris baru yang DIIKUTI OLEH pola header versi.
    // Pola header versi = ### [spasi] versi [spasi] (tanggal)
    const versions = markdownContent.split(/\n(?=###\s[\w.-]+\s+\(\d{4}-\d{2}-\d{2}\))/);

    const startIndex = versions[0].startsWith('###') ? 0 : 1;

    for (let i = startIndex; i < versions.length; i++) {
        const block = versions[i];
        if (!block.trim()) continue;

        const lines = block.split('\n');
        // Buang '### ' dari baris header
        const headerLine = lines.shift().replace(/^###\s*/, '').trim();

        // Regex ini bisa kita pakai lagi karena headerLine sudah bersih
        const headerMatch = headerLine.match(/^([\w.-]+)\s+\((\d{4}-\d{2}-\d{2})\)$/);

        if (headerMatch) {
            const version = headerMatch[1];
            const date = headerMatch[2];
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

// =================================================================
// UPDATED: buildCategoryMap (Mendukung Hybrid Commands)
// =================================================================
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

                // 1. Cek untuk slashCommand
                if (command.slashCommand) {
                    const name = command.slashCommand.name;
                    if (name) commandNames.push(name);
                }

                // 2. Cek untuk contextMenuCommand
                if (command.contextMenuCommand) {
                    const name = command.contextMenuCommand.name;
                    if (name) commandNames.push(name);
                }

                // 3. Fallback untuk struktur lama (command.data)
                if (command.data) {
                    const name = command.data.name;
                    if (name) commandNames.push(name);
                }

                // 4. Fallback untuk properti .name
                if (typeof command.name === 'string') {
                    commandNames.push(command.name);
                }

                // Hapus duplikat dan daftarkan ke map
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

// =================================================================
// FINAL VERSION: getCommandsData (DENGAN LOGIKA DE-DUPLIKASI)
// =================================================================
async function getCommandsData(client) {
    const allCommands = [];
    const categories = new Set();
    let totalCommandCount = 0;
    const processedCommands = new Set(); // Set untuk melacak command unik yang sudah diproses

    client.commands.forEach((command) => {
        if (command.ownerOnly === true) {
            return; // Langsung skip ke command berikutnya
        }
        // 1. Proses Slash Command (baik dari `slashCommand` atau `data` untuk backward compatibility)
        const slashData = command.slashCommand || command.data;
        if (slashData) {
            const commandJSON = typeof slashData.toJSON === 'function' ? slashData.toJSON() : slashData;

            // if (!commandJSON.name || !commandJSON.description) {
            //   logger.warn(`⏩ Skipping command with missing name or description: ${commandJSON.name || 'N/A'}`);
            //   return;
            // }

            const uniqueKey = `slash-${commandJSON.name}`; // Kunci unik untuk slash command

            // Cek apakah command ini sudah diproses untuk menghindari duplikasi
            if (!processedCommands.has(uniqueKey)) {
                processedCommands.add(uniqueKey); // Tandai sebagai sudah diproses

                const categoryName = categoryMap[commandJSON.name] || 'uncategorized';
                const parsedCommand = {
                    name: commandJSON.name,
                    description: commandJSON.description || 'No description provided.',
                    category: categoryName,
                    options: [],
                    subcommands: [],
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
                                    });
                                });
                            } else {
                                totalCommandCount += 1;
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

        // 2. Proses Context Menu Command
        if (command.contextMenuCommand) {
            const commandJSON =
                typeof command.contextMenuCommand.toJSON === 'function' ? command.contextMenuCommand.toJSON() : command.contextMenuCommand;
            const uniqueKey = `context-${commandJSON.name}`; // Kunci unik untuk context menu

            // Cek apakah command ini sudah diproses untuk menghindari duplikasi
            if (!processedCommands.has(uniqueKey)) {
                processedCommands.add(uniqueKey); // Tandai sebagai sudah diproses

                const categoryName = categoryMap[commandJSON.name] || 'uncategorized';
                // --- LOGIKA DESKRIPSI PINTAR DIMULAI DI SINI ---
                let description;

                // Prioritas 1: Cari deskripsi khusus `contextMenuDescription`
                if (command.contextMenuDescription) {
                    description = command.contextMenuDescription;
                }
                // Prioritas 2: "Colong" deskripsi dari slash command jika ada
                else if (command.slashCommand && command.slashCommand.description) {
                    description = command.slashCommand.description;
                }
                // Prioritas 3: Fallback ke deskripsi generik
                else {
                    if (commandJSON.type === ApplicationCommandType.Message) {
                        description = 'Right-click on a message to use this command.';
                    } else {
                        description = 'Right-click on a user to use this command.';
                    }
                }

                // --- LOGIKA DESKRIPSI PINTAR SELESAI ---
                const parsedCommand = {
                    name: commandJSON.name,
                    description: description,
                    category: categoryName,
                    options: [],
                    subcommands: [],
                    type: commandJSON.type === ApplicationCommandType.User ? 'user' : 'message',
                    isContextMenu: true,
                };

                allCommands.push(parsedCommand);
                categories.add(categoryName);
                totalCommandCount += 1; // Context menu dihitung sebagai 1 command
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

        // Defensive: always ensure req.settings is an object, never null
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
            // Jika settings masih bermasalah setelah semua usaha,
            // log errornya agar kamu tahu, dan set ke objek kosong agar EJS tidak crash.
            logger.error(`Failed to get a valid settings instance for guild ${guildId}`);
            settings = {};
        }

        // Teruskan objeknya, baik yang sudah dinormalisasi maupun objek kosong jika gagal
        req.settings = settings;
        return next();
    } catch (error) {
        console.error('Error di middleware checkServerAccess:', error);
        // Defensive: always pass settings as an object to avoid view errors
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
    // Default values
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
    // Resolve pages directory and validate the view exists to avoid EJS include errors
    const viewsRoot = path.join(__dirname, '..', 'views');
    const pagesDir = path.join(viewsRoot, 'pages');
    const candidate = typeof viewName === 'string' ? path.join(pagesDir, `${viewName}.ejs`) : null;
    const viewExists = candidate ? fs.existsSync(candidate) : false;

    // If the page doesn't exist, nullify viewName so layout can show fallback message
    const safeViewName = viewExists ? viewName : null;

    // Gabungkan, opts bisa override defaults
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
