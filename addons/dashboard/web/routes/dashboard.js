/**
 * @namespace: addons/dashboard/web/routes/dashboard.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */

const router = require('express').Router();
const { PermissionsBitField } = require('discord.js');
const ServerSetting = require('@coreModels/ServerSetting');
const ModLog = require('@coreModels/ModLog');
const client = require('@src/KythiaClient');

// =================================================================
// MIDDLEWARE (PENTING)
// =================================================================

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
        req.settings = await ServerSetting.getCache({ guildId: guild.id });
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
        });
    }
}

// Helper: boilerplate render untuk dashboard
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
    // Gabungkan, opts bisa override defaults
    const renderData = { ...defaults, ...opts, viewName };
    res.render('layouts/dashMain', renderData);
}

// Global middleware to define `guilds` for all dashboard routes
router.use('/dashboard', isAuthorized, (req, res, next) => {
    const botClient = req.app.locals.bot;
    const botGuilds = new Set(botClient.guilds.cache.map((g) => g.id));
    // Mark which guilds have the bot and which are manageable
    const guildsWithBotStatus = req.user.guilds.map((guild) => ({
        ...guild,
        hasBot: botGuilds.has(guild.id),
    }));
    // Only include guilds the user can manage
    const manageableGuilds = guildsWithBotStatus.filter((g) => {
        const perms = new PermissionsBitField(BigInt(g.permissions));
        return perms.has(PermissionsBitField.Flags.ManageGuild);
    });
    // Make available to all dashboard views
    res.locals.guilds = manageableGuilds;
    next();
});

router.get('/dashboard/servers', (req, res) => {
    const botClient = req.app.locals.bot;
    renderDash(res, 'servers', {
        title: 'Servers',
        stats: {
            memberCount: botClient.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
            channelCount: botClient.guilds.cache.reduce((acc, guild) => acc + guild.channels.cache.size, 0),
            roleCount: botClient.guilds.cache.reduce((acc, guild) => acc + guild.roles.cache.size, 0),
        },
    });
});

router.get('/dashboard/:guildId', isAuthorized, checkServerAccess, async (req, res) => {
    let recentLogs = [];
    try {
        const logsFromDb = await ModLog.findAll({
            where: { guildId: req.params.guildId },
            order: [['createdAt', 'DESC']],
            limit: 5,
        });
        recentLogs = logsFromDb.map((log) => ({
            moderator: log.moderatorTag,
            target: log.targetTag,
            action: log.action,
            reason: log.reason || 'Tidak ada alasan',
        }));
    } catch (error) {
        console.error('Gagal mengambil log dari database:', error);
    }
    renderDash(res, 'dashboard', {
        guild: req.guild,
        guildId: req.params.guildId,
        stats: {
            memberCount: req.guild.memberCount,
            channelCount: req.guild.channels.cache.size,
            roleCount: req.guild.roles.cache.size,
        },
        currentPage: '/dashboard',
        logs: recentLogs,
        page: 'dashboard',
        title: 'Dashboard',
    });
});

router.get('/dashboard/:guildId/settings', isAuthorized, checkServerAccess, (req, res) => {
    const guild = req.guild;
    const channels = {
        text: guild.channels.cache.filter((c) => c.type === 0).toJSON(),
        voice: guild.channels.cache.filter((c) => c.type === 2).toJSON(),
    };
    const roles = guild.roles.cache.toJSON();
    renderDash(res, 'settings', {
        guild: guild,
        guildId: guild.id,
        settings: req.settings,
        channels: channels,
        roles: roles,
        page: 'settings',
        title: 'Settings',
        query: req.query,
        currentPage: '/dashboard/settings',
    });
});

router.post('/dashboard/:guildId/settings', isAuthorized, checkServerAccess, async (req, res) => {
    try {
        const settings = req.settings;
        const guild = req.guild;
        const body = req.body;
        const settingKeys = Object.keys(ServerSetting.getAttributes());
        for (const key of settingKeys) {
            if (['id', 'guildId', 'guildName'].includes(key)) continue;
            const attribute = ServerSetting.getAttributes()[key];
            const value = body[key];
            if (attribute.type.key === 'BOOLEAN') {
                settings[key] = value === 'on';
            } else if (attribute.type.key === 'JSON') {
                settings[key] = value ? (Array.isArray(value) ? value : [value]) : [];
            } else if (value !== undefined) {
                settings[key] = value === '' ? null : value;
            }
        }
        await settings.save();
        res.redirect(`/dashboard/${guild.id}/settings?success=true`);
    } catch (error) {
        console.error('Error saat menyimpan pengaturan:', error);
        renderDash(res, 'error', {
            title: 'Gagal Menyimpan',
            message: 'Terjadi kesalahan saat mencoba menyimpan pengaturan Anda.',
            page: 'settings',
            currentPage: '',
            guild: req.guild || null,
        });
    }
});

router.get('/dashboard/:guildId/features', isAuthorized, checkServerAccess, (req, res) => {
    renderDash(res, 'features', {
        guild: req.guild,
        settings: req.settings,
        page: 'features',
        query: req.query,
        currentPage: '',
    });
});

router.post('/dashboard/:guildId/features', isAuthorized, checkServerAccess, async (req, res) => {
    try {
        const settings = req.settings;
        const guild = req.guild;
        const body = req.body;
        const featureKeys = Object.keys(ServerSetting.getAttributes()).filter((k) => k.endsWith('On'));
        for (const key of featureKeys) {
            settings[key] = body[key] === 'on';
        }
        await settings.save();
        res.redirect(`/dashboard/${guild.id}/features?success=true`);
    } catch (error) {
        console.error('Error saat menyimpan fitur:', error);
        renderDash(res, 'error', {
            title: 'Gagal Menyimpan',
            message: 'Terjadi kesalahan saat mencoba menyimpan pengaturan fitur.',
            page: 'features',
            currentPage: '',
            guild: req.guild || null,
        });
    }
});

router.get('/dashboard/:guildId/welcomer', isAuthorized, checkServerAccess, (req, res) => {
    const channels = {
        text: req.guild.channels.cache.filter((c) => c.type === 0).toJSON(),
    };
    renderDash(res, 'welcomer', {
        guild: req.guild,
        settings: req.settings,
        channels: channels,
        page: 'welcomer',
        query: req.query,
        currentPage: '',
    });
});

router.post('/dashboard/:guildId/welcomer', isAuthorized, checkServerAccess, async (req, res) => {
    try {
        const settings = req.settings;
        const guild = req.guild;
        const body = req.body;
        settings.welcomeInChannelId = body.welcomeInChannelId || null;
        settings.welcomeOutChannelId = body.welcomeOutChannelId || null;
        settings.welcomeInText = body.welcomeInText || null;
        settings.welcomeOutText = body.welcomeOutText || null;
        await settings.save();
        res.redirect(`/dashboard/${guild.id}/welcomer?success=true`);
    } catch (error) {
        console.error('Error saat menyimpan pengaturan welcomer:', error);
        renderDash(res, 'error', {
            title: 'Gagal Menyimpan',
            message: 'Terjadi kesalahan saat mencoba menyimpan pengaturan welcomer.',
            page: 'welcomer',
            currentPage: '',
            guild: req.guild || null,
        });
    }
});

router.get('/admin/chat', (req, res) => {
    const guilds = client.guilds.cache.map((guild) => ({
        id: guild.id,
        name: guild.name,
        icon: guild.iconURL({ dynamic: true, size: 128 }) || 'https://cdn.discordapp.com/embed/avatars/0.png',
    }));
    res.render('chat', {
        guilds,
        botUser: {
            username: client.user.username,
            avatar: client.user.displayAvatarURL(),
        },
    });
});

module.exports = router;
