/**
 * @namespace: addons/dashboard/web/routes/index.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { loadVisitorCounts, trackVisitor } = require('../helpers/visitor');
const { parseChangelog, getCommandsData } = require('../helpers');
const router = require('express').Router();
const logger = require('@coreHelpers/logger');
const path = require('path');
const fs = require('fs');

router.get('/', trackVisitor, loadVisitorCounts, async (req, res) => {
    const client = req.app.get('botClient');
    let totalServers = 0;
    let totalMembers = 0;

    if (client && client.guilds && client.guilds.cache) {
        totalServers = client.guilds.cache.size;

        const memberSet = new Set();
        if (client && client.guilds && client.guilds.cache) {
            totalServers = client.guilds.cache.size;

            totalMembers = client.guilds.cache.reduce((acc, guild) => acc + (guild.memberCount || 0), 0);
        }
        totalMembers = memberSet.size;

        if (totalMembers === 0) {
            totalMembers = client.guilds.cache.reduce((acc, guild) => acc + (guild.memberCount || 0), 0);
        }
    }

    res.render('layouts/main', {
        viewName: 'home',
        title: 'Home',
        botClientId: kythia.bot.clientId,
        botPermissions: '8',
        user: req.user,
        currentPage: '/',

        page: '/',
        todayVisitors: res.locals.todayVisitors,
        totalVisitors: res.locals.totalVisitors,
        totalServers,
        totalMembers,
    });
});

router.get('/partner', trackVisitor, loadVisitorCounts, (req, res) => {
    res.render('layouts/main', {
        viewName: 'partner',
        title: 'Partner',
        botClientId: kythia.bot.clientId,
        botPermissions: '8',
        user: req.user,
        currentPage: '/partner',

        page: '/partner',
    });
});

router.get('/owner', trackVisitor, loadVisitorCounts, (req, res) => {
    res.render('layouts/main', {
        viewName: 'owner',
        title: 'Owner',
        botClientId: kythia.bot.clientId,
        botPermissions: '8',
        user: req.user,
        currentPage: '/owner',

        page: '/owner',
    });
});

router.get('/commands', trackVisitor, loadVisitorCounts, async (req, res) => {
    try {
        const client = req.app.get('botClient');
        if (!client || !client.isReady()) {
            return res.status(503).render('layouts/main', {
                viewName: 'error',
                title: 'Bot Not Ready',
                message: 'The bot is not ready or is restarting. Please try again in a moment.',
                user: req.user || null,
                page: 'error',
                currentPage: '/commands',

                guild: null,
            });
        }
        const { commands, categories, totalCommands } = await getCommandsData(client);
        res.render('layouts/main', {
            viewName: 'commands',
            commands: commands,
            categories: categories,
            totalCommands: totalCommands,
            title: 'Bot Commands',
            currentPage: '/commands',

            page: '/',
            user: req.user || null,
            guild: null,
        });
    } catch (error) {
        logger.error('Failed to fetch command data:', error);
        res.status(500).render('layouts/main', {
            viewName: 'error',
            title: 'Failed to load Command page',
            message: 'An error occurred while trying to save your settings.',
            user: req.user || null,
            page: 'settings',
            currentPage: '',

            guild: req.guild || null,
        });
    }
});

router.get('/changelog', trackVisitor, loadVisitorCounts, (req, res) => {
    try {
        const changelogPath = path.resolve(__dirname, '../../../../changelog.md');
        const changelogMd = fs.readFileSync(changelogPath, 'utf-8');
        const parsedChangelogs = parseChangelog(changelogMd);

        res.render('layouts/main', {
            viewName: 'changelog',
            title: 'Changelog',
            user: req.user,
            currentPage: '/changelog',
            page: '/',

            changelogs: parsedChangelogs,
        });
    } catch (error) {
        logger.error('Error reading or parsing changelog:', error);
        res.render('error', { message: 'Could not load the changelog.' });
    }
});

router.get('/tos', trackVisitor, loadVisitorCounts, (req, res) => {
    res.render('layouts/main', {
        viewName: 'tos',
        title: 'Terms of Service',
        user: req.user,
        currentPage: '/tos',

        page: '/',
    });
});

router.get('/privacy', trackVisitor, loadVisitorCounts, (req, res) => {
    res.render('layouts/main', {
        viewName: 'privacy',
        title: 'Privacy Policy',
        user: req.user,
        currentPage: '/privacy',

        page: '/',
    });
});

router.get('/premium', trackVisitor, loadVisitorCounts, (req, res) => {
    res.render('layouts/main', {
        viewName: 'premium',
        title: 'Premium - Kythia',
        currentPage: '/premium',

        page: '/',
        user: req.user || null,
        guild: null,
    });
});

router.get('/gallery', trackVisitor, loadVisitorCounts, (req, res) => {
    res.render('layouts/main', {
        viewName: 'gallery',
        title: 'Gallery',
        user: req.user,
        currentPage: '/gallery',
        page: '/',
    });
});

module.exports = router;
