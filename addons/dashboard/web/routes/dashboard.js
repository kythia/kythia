/**
 * @namespace: addons/dashboard/web/routes/dashboard.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { isAuthorized, checkServerAccess, renderDash } = require('../helpers');
const ServerSetting = require('@coreModels/ServerSetting');
const { PermissionsBitField } = require('discord.js');
const ModLog = require('@coreModels/ModLog');
const router = require('express').Router();
const client = require('kythia-core').KythiaClient;

router.use('/dashboard', isAuthorized, (req, res, next) => {
    const botClient = req.app.locals.bot;
    const botGuilds = new Set(botClient.guilds.cache.map((g) => g.id));

    const guildsWithBotStatus = req.user.guilds.map((guild) => ({
        ...guild,
        hasBot: botGuilds.has(guild.id),
    }));

    const manageableGuilds = guildsWithBotStatus.filter((g) => {
        const perms = new PermissionsBitField(BigInt(g.permissions));
        return perms.has(PermissionsBitField.Flags.ManageGuild);
    });

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
        const logsFromDb = await ModLog.getAllCache({
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
