/**
 * @namespace: addons/dashboard/web/routes/settings.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */

const router = require('express').Router();
const { isAuthorized, checkServerAccess, renderDash } = require('../helpers');

// =================================================================
// GET ROUTES
// =================================================================

// Main settings overview
router.get('/dashboard/:guildId/settings', isAuthorized, checkServerAccess, (req, res) => {
    const guild = req.guild;
    const channels = {
        text: guild.channels.cache.filter((c) => c.type === 0).toJSON(),
        voice: guild.channels.cache.filter((c) => c.type === 2).toJSON(),
        category: guild.channels.cache.filter((c) => c.type === 4).toJSON(),
    };
    const roles = guild.roles.cache.toJSON();

    renderDash(res, 'settings', {
        guild: guild,
        guildId: guild.id,
        settings: req.settings,
        channels: channels,
        roles: roles,
        page: 'settings',
        title: 'Settings Overview',
        query: req.query,
        currentPage: '/dashboard/settings',
    });
});

router.get('/dashboard/:guildId/settings/automod', isAuthorized, checkServerAccess, (req, res) => {
    const guild = req.guild;
    const channels = {
        text: guild.channels.cache.filter((c) => c.type === 0).toJSON(),
    };
    const roles = guild.roles.cache.toJSON();

    renderDash(res, 'settings/automod', {
        guild: guild,
        guildId: guild.id,
        settings: req.settings,
        channels: channels,
        roles: roles,
        page: 'settings/automod',
        title: 'Automod Settings',
        currentPage: '/dashboard/settings/automod',
        query: req.query,
    });
});

router.get('/dashboard/:guildId/settings/stats', isAuthorized, checkServerAccess, (req, res) => {
    const guild = req.guild;
    const channels = {
        text: guild.channels.cache.filter((c) => c.type === 0).toJSON(),
        voice: guild.channels.cache.filter((c) => c.type === 2).toJSON(),
        category: guild.channels.cache.filter((c) => c.type === 4).toJSON(),
    };

    renderDash(res, 'settings/stats', {
        guild: guild,
        guildId: guild.id,
        settings: req.settings,
        channels: channels,
        page: 'settings/stats',
        title: 'Server Stats Settings',
        currentPage: '/dashboard/settings/stats',
        query: req.query,
    });
});

router.get('/dashboard/:guildId/settings/welcome', isAuthorized, checkServerAccess, (req, res) => {
    const guild = req.guild;
    const channels = {
        text: guild.channels.cache.filter((c) => c.type === 0).toJSON(),
    };
    const roles = guild.roles.cache.toJSON();

    renderDash(res, 'settings/welcome', {
        guild: guild,
        guildId: guild.id,
        settings: req.settings,
        channels: channels,
        roles: roles,
        page: 'settings/welcome',
        title: 'Welcome Settings',
        currentPage: '/dashboard/settings/welcome',
        query: req.query,
    });
});

router.get('/dashboard/:guildId/settings/leveling', isAuthorized, checkServerAccess, (req, res) => {
    const guild = req.guild;
    const channels = {
        text: guild.channels.cache.filter((c) => c.type === 0).toJSON(),
    };
    const roles = guild.roles.cache.toJSON();

    renderDash(res, 'settings/leveling', {
        guild: guild,
        guildId: guild.id,
        settings: req.settings,
        channels: channels,
        roles: roles,
        page: 'settings/leveling',
        title: 'Leveling Settings',
        currentPage: '/dashboard/settings/leveling',
        query: req.query,
    });
});

router.get('/dashboard/:guildId/settings/minecraft', isAuthorized, checkServerAccess, (req, res) => {
    const guild = req.guild;
    const channels = {
        text: guild.channels.cache.filter((c) => c.type === 0).toJSON(),
        voice: guild.channels.cache.filter((c) => c.type === 2).toJSON(),
    };

    renderDash(res, 'settings/minecraft', {
        guild: guild,
        guildId: guild.id,
        settings: req.settings,
        channels: channels,
        page: 'settings/minecraft',
        title: 'Minecraft Settings',
        currentPage: '/dashboard/settings/minecraft',
        query: req.query,
    });
});

router.get('/dashboard/:guildId/settings/cooldown', isAuthorized, checkServerAccess, (req, res) => {
    renderDash(res, 'settings/cooldown', {
        guild: req.guild,
        guildId: req.guild.id,
        settings: req.settings,
        page: 'settings/cooldown',
        title: 'Cooldown Settings',
        currentPage: '/dashboard/settings/cooldown',
        query: req.query,
    });
});

router.get('/dashboard/:guildId/settings/language', isAuthorized, checkServerAccess, (req, res) => {
    renderDash(res, 'settings/language', {
        guild: req.guild,
        guildId: req.guild.id,
        settings: req.settings,
        page: 'settings/language',
        title: 'Language Settings',
        currentPage: '/dashboard/settings/language',
        query: req.query,
    });
});

router.get('/dashboard/:guildId/settings/testimony', isAuthorized, checkServerAccess, (req, res) => {
    const guild = req.guild;
    const channels = {
        text: guild.channels.cache.filter((c) => c.type === 0).toJSON(),
    };

    renderDash(res, 'settings/testimony', {
        guild: guild,
        guildId: guild.id,
        settings: req.settings,
        channels: channels,
        page: 'settings/testimony',
        title: 'Testimony Settings',
        currentPage: '/dashboard/settings/testimony',
        query: req.query,
    });
});

router.get('/dashboard/:guildId/settings/ai', isAuthorized, checkServerAccess, (req, res) => {
    const guild = req.guild;
    const channels = {
        text: guild.channels.cache.filter((c) => c.type === 0).toJSON(),
    };

    renderDash(res, 'settings/ai', {
        guild: guild,
        guildId: guild.id,
        settings: req.settings,
        channels: channels,
        page: 'settings/ai',
        title: 'AI Settings',
        currentPage: '/dashboard/settings/ai',
        query: req.query,
    });
});

router.get('/dashboard/:guildId/settings/streak', isAuthorized, checkServerAccess, (req, res) => {
    const guild = req.guild;
    const roles = guild.roles.cache.toJSON();

    renderDash(res, 'settings/streak', {
        guild: guild,
        guildId: guild.id,
        settings: req.settings,
        roles: roles,
        page: 'settings/streak',
        title: 'Streak Settings',
        currentPage: '/dashboard/settings/streak',
        query: req.query,
    });
});

router.get('/dashboard/:guildId/settings/channels', isAuthorized, checkServerAccess, (req, res) => {
    const guild = req.guild;
    const channels = {
        text: guild.channels.cache.filter((c) => c.type === 0).toJSON(),
    };

    renderDash(res, 'settings/channels', {
        guild: guild,
        guildId: guild.id,
        settings: req.settings,
        channels: channels,
        page: 'settings/channels',
        title: 'Channel Settings',
        currentPage: '/dashboard/settings/channels',
        query: req.query,
    });
});

router.get('/dashboard/:guildId/settings/features', isAuthorized, checkServerAccess, (req, res) => {
    renderDash(res, 'settings/features', {
        guild: req.guild,
        guildId: req.guild.id,
        settings: req.settings,
        page: 'settings/features',
        title: 'Feature Toggle',
        currentPage: '/dashboard/settings/features',
        query: req.query,
    });
});

// =================================================================
// POST ROUTES
// =================================================================

router.post('/dashboard/:guildId/settings/automod', isAuthorized, checkServerAccess, async (req, res) => {
    try {
        const settings = req.settings;
        const body = req.body;

        // Update automod toggles - always update, not only if (body.XXX)
        settings.antiInviteOn = body.antiInviteOn === 'on';
        settings.antiLinkOn = body.antiLinkOn === 'on';
        settings.antiSpamOn = body.antiSpamOn === 'on';
        settings.antiBadwordOn = body.antiBadwordOn === 'on';
        settings.antiMentionOn = body.antiMentionOn === 'on';

        if (body.modLogChannelId) settings.modLogChannelId = body.modLogChannelId;

        if (body.whitelist !== undefined) {
            const arr = Array.isArray(body.whitelist) ? body.whitelist : [body.whitelist];
            settings.whitelist = arr.filter(item => item && item.trim() !== '');
        }
        if (body.badwords !== undefined) {
            const arr = Array.isArray(body.badwords) ? body.badwords : [body.badwords];
            settings.badwords = arr.filter(item => item && item.trim() !== '');
        }
        if (body.badwordWhitelist !== undefined) {
            const arr = Array.isArray(body.badwordWhitelist) ? body.badwordWhitelist : [body.badwordWhitelist];
            settings.badwordWhitelist = arr.filter(item => item && item.trim() !== '');
        }
        if (body.ignoredChannels !== undefined) {
            const arr = Array.isArray(body.ignoredChannels) ? body.ignoredChannels : [body.ignoredChannels];
            settings.ignoredChannels = arr.filter(item => item && item.trim() !== '');
        }

        await settings.saveAndUpdateCache('guildId');
        res.redirect(`/dashboard/${req.guild.id}/settings/automod?success=true`);
    } catch (error) {
        console.error('Error saving automod settings:', error);
        res.redirect(`/dashboard/${req.guild.id}/settings/automod?error=true`);
    }
});

router.post('/dashboard/:guildId/settings/stats', isAuthorized, checkServerAccess, async (req, res) => {
    try {
        const settings = req.settings;
        const body = req.body;

        // Toggle for stats
        settings.serverStatsOn = body.serverStatsOn === 'on';
        if (body.serverStatsCategoryId) settings.serverStatsCategoryId = body.serverStatsCategoryId;

        // Handle server stats array (normalize object/string to array)
        if (body.serverStats !== undefined) {
            let rawStats = body.serverStats;
            try {
                if (typeof rawStats === 'string') {
                    rawStats = JSON.parse(rawStats || '[]');
                }
            } catch (_) {
                rawStats = [];
            }
            if (!Array.isArray(rawStats) && rawStats && typeof rawStats === 'object') {
                rawStats = Object.values(rawStats);
            }

            settings.serverStats = Array.isArray(rawStats)
                ? rawStats.filter(Boolean).map((item) => ({
                      channelId: item.channelId || item.channel || '',
                      format: item.format || '',
                      enabled: item.enabled === true || item.enabled === 'on' || item.enabled === 'true',
                  }))
                : [];
        }

        // Welcome out passthrough from stats page
        settings.welcomeOutOn = body.welcomeOutOn === 'on';
        if (body.welcomeOutChannelId) settings.welcomeOutChannelId = body.welcomeOutChannelId;
        if (body.welcomeOutBackgroundUrl) settings.welcomeOutBackgroundUrl = body.welcomeOutBackgroundUrl;
        if (body.welcomeOutText) settings.welcomeOutText = body.welcomeOutText;

        await settings.saveAndUpdateCache('guildId');
        res.redirect(`/dashboard/${req.guild.id}/settings/stats?success=true`);
    } catch (error) {
        console.error('Error saving stats settings:', error);
        res.redirect(`/dashboard/${req.guild.id}/settings/stats?error=true`);
    }
});

router.post('/dashboard/:guildId/settings/welcome', isAuthorized, checkServerAccess, async (req, res) => {
    try {
        const settings = req.settings;
        const body = req.body;

        // Welcome channels
        if (body.welcomeInChannelId) settings.welcomeInChannelId = body.welcomeInChannelId;
        if (body.welcomeOutChannelId) settings.welcomeOutChannelId = body.welcomeOutChannelId;
        if (body.welcomeRoleId) settings.welcomeRoleId = body.welcomeRoleId;

        // Welcome text
        if (body.welcomeInText) settings.welcomeInText = body.welcomeInText;
        if (body.welcomeOutText) settings.welcomeOutText = body.welcomeOutText;

        // Welcome backgrounds
        if (body.welcomeInBackgroundUrl) settings.welcomeInBackgroundUrl = body.welcomeInBackgroundUrl;
        if (body.welcomeOutBackgroundUrl) settings.welcomeOutBackgroundUrl = body.welcomeOutBackgroundUrl;

        // Welcome features
        settings.welcomeInOn = body.welcomeInOn === 'on';
        settings.welcomeOutOn = body.welcomeOutOn === 'on';

        // Advanced Welcome In
        if (body.welcomeInBannerWidth) settings.welcomeInBannerWidth = parseInt(body.welcomeInBannerWidth);
        if (body.welcomeInBannerHeight) settings.welcomeInBannerHeight = parseInt(body.welcomeInBannerHeight);
        if (body.welcomeInForegroundUrl) settings.welcomeInForegroundUrl = body.welcomeInForegroundUrl;
        if (body.welcomeInOverlayColor) settings.welcomeInOverlayColor = body.welcomeInOverlayColor;

        settings.welcomeInAvatarEnabled = body.welcomeInAvatarEnabled === 'on';
        if (body.welcomeInAvatarSize) settings.welcomeInAvatarSize = parseInt(body.welcomeInAvatarSize);
        if (body.welcomeInAvatarShape) settings.welcomeInAvatarShape = body.welcomeInAvatarShape;
        if (body.welcomeInAvatarYOffset) settings.welcomeInAvatarYOffset = parseInt(body.welcomeInAvatarYOffset);
        if (body.welcomeInAvatarBorderWidth) settings.welcomeInAvatarBorderWidth = parseInt(body.welcomeInAvatarBorderWidth);
        if (body.welcomeInAvatarBorderColor) settings.welcomeInAvatarBorderColor = body.welcomeInAvatarBorderColor;

        if (body.welcomeInMainTextContent) settings.welcomeInMainTextContent = body.welcomeInMainTextContent;
        if (body.welcomeInMainTextFont) settings.welcomeInMainTextFont = body.welcomeInMainTextFont;
        if (body.welcomeInMainTextFontFamily) settings.welcomeInMainTextFontFamily = body.welcomeInMainTextFontFamily;
        if (body.welcomeInMainTextColor) settings.welcomeInMainTextColor = body.welcomeInMainTextColor;
        if (body.welcomeInMainTextYOffset) settings.welcomeInMainTextYOffset = parseInt(body.welcomeInMainTextYOffset);

        if (body.welcomeInSubTextContent) settings.welcomeInSubTextContent = body.welcomeInSubTextContent;
        if (body.welcomeInSubTextFont) settings.welcomeInSubTextFont = body.welcomeInSubTextFont;
        if (body.welcomeInSubTextFontFamily) settings.welcomeInSubTextFontFamily = body.welcomeInSubTextFontFamily;
        if (body.welcomeInSubTextColor) settings.welcomeInSubTextColor = body.welcomeInSubTextColor;
        if (body.welcomeInSubTextYOffset) settings.welcomeInSubTextYOffset = parseInt(body.welcomeInSubTextYOffset);

        if (body.welcomeInShadowColor) settings.welcomeInShadowColor = body.welcomeInShadowColor;
        if (body.welcomeInShadowBlur) settings.welcomeInShadowBlur = parseInt(body.welcomeInShadowBlur);

        if (body.welcomeInBorderColor) settings.welcomeInBorderColor = body.welcomeInBorderColor;
        if (body.welcomeInBorderWidth) settings.welcomeInBorderWidth = parseInt(body.welcomeInBorderWidth);

        if (body.welcomeInExtraDraw) settings.welcomeInExtraDraw = body.welcomeInExtraDraw;

        // Advanced Welcome Out
        if (body.welcomeOutBannerWidth) settings.welcomeOutBannerWidth = parseInt(body.welcomeOutBannerWidth);
        if (body.welcomeOutBannerHeight) settings.welcomeOutBannerHeight = parseInt(body.welcomeOutBannerHeight);
        if (body.welcomeOutForegroundUrl) settings.welcomeOutForegroundUrl = body.welcomeOutForegroundUrl;
        if (body.welcomeOutOverlayColor) settings.welcomeOutOverlayColor = body.welcomeOutOverlayColor;

        settings.welcomeOutAvatarEnabled = body.welcomeOutAvatarEnabled === 'on';
        if (body.welcomeOutAvatarSize) settings.welcomeOutAvatarSize = parseInt(body.welcomeOutAvatarSize);
        if (body.welcomeOutAvatarShape) settings.welcomeOutAvatarShape = body.welcomeOutAvatarShape;
        if (body.welcomeOutAvatarYOffset) settings.welcomeOutAvatarYOffset = parseInt(body.welcomeOutAvatarYOffset);
        if (body.welcomeOutAvatarBorderWidth) settings.welcomeOutAvatarBorderWidth = parseInt(body.welcomeOutAvatarBorderWidth);
        if (body.welcomeOutAvatarBorderColor) settings.welcomeOutAvatarBorderColor = body.welcomeOutAvatarBorderColor;

        if (body.welcomeOutMainTextContent) settings.welcomeOutMainTextContent = body.welcomeOutMainTextContent;
        if (body.welcomeOutMainTextFont) settings.welcomeOutMainTextFont = body.welcomeOutMainTextFont;
        if (body.welcomeOutMainTextFontFamily) settings.welcomeOutMainTextFontFamily = body.welcomeOutMainTextFontFamily;
        if (body.welcomeOutMainTextColor) settings.welcomeOutMainTextColor = body.welcomeOutMainTextColor;
        if (body.welcomeOutMainTextYOffset) settings.welcomeOutMainTextYOffset = parseInt(body.welcomeOutMainTextYOffset);

        if (body.welcomeOutSubTextContent) settings.welcomeOutSubTextContent = body.welcomeOutSubTextContent;
        if (body.welcomeOutSubTextFont) settings.welcomeOutSubTextFont = body.welcomeOutSubTextFont;
        if (body.welcomeOutSubTextFontFamily) settings.welcomeOutSubTextFontFamily = body.welcomeOutSubTextFontFamily;
        if (body.welcomeOutSubTextColor) settings.welcomeOutSubTextColor = body.welcomeOutSubTextColor;
        if (body.welcomeOutSubTextYOffset) settings.welcomeOutSubTextYOffset = parseInt(body.welcomeOutSubTextYOffset);

        if (body.welcomeOutShadowColor) settings.welcomeOutShadowColor = body.welcomeOutShadowColor;
        if (body.welcomeOutShadowBlur) settings.welcomeOutShadowBlur = parseInt(body.welcomeOutShadowBlur);

        if (body.welcomeOutBorderColor) settings.welcomeOutBorderColor = body.welcomeOutBorderColor;
        if (body.welcomeOutBorderWidth) settings.welcomeOutBorderWidth = parseInt(body.welcomeOutBorderWidth);

        if (body.welcomeOutExtraDraw) settings.welcomeOutExtraDraw = body.welcomeOutExtraDraw;

        await settings.saveAndUpdateCache('guildId');
        res.redirect(`/dashboard/${req.guild.id}/settings/welcome?success=true`);
    } catch (error) {
        console.error('Error saving welcome settings:', error);
        res.redirect(`/dashboard/${req.guild.id}/settings/welcome?error=true`);
    }
});

router.post('/dashboard/:guildId/settings/leveling', isAuthorized, checkServerAccess, async (req, res) => {
    try {
        const settings = req.settings;
        const body = req.body;

        settings.levelingOn = body.levelingOn === 'on';
        if (body.levelingChannelId) settings.levelingChannelId = body.levelingChannelId;
        if (body.levelingCooldown) settings.levelingCooldown = parseInt(body.levelingCooldown) * 1000;
        if (body.levelingXp) settings.levelingXp = parseInt(body.levelingXp);

        // Handle role rewards (normalize object/string to array)
        if (body.roleRewards !== undefined) {
            let rawRewards = body.roleRewards;
            try {
                if (typeof rawRewards === 'string') {
                    rawRewards = JSON.parse(rawRewards || '[]');
                }
            } catch (_) {
                rawRewards = [];
            }

            if (!Array.isArray(rawRewards) && rawRewards && typeof rawRewards === 'object') {
                rawRewards = Object.values(rawRewards);
            }

            settings.roleRewards = Array.isArray(rawRewards)
                ? rawRewards.filter(Boolean).map((item) => ({
                      level: parseInt(item.level) || 1,
                      role: item.role || item.roleId || '',
                  }))
                : [];
        }

        await settings.saveAndUpdateCache('guildId');
        res.redirect(`/dashboard/${req.guild.id}/settings/leveling?success=true`);
    } catch (error) {
        console.error('Error saving leveling settings:', error);
        res.redirect(`/dashboard/${req.guild.id}/settings/leveling?error=true`);
    }
});

router.post('/dashboard/:guildId/settings/minecraft', isAuthorized, checkServerAccess, async (req, res) => {
    try {
        const settings = req.settings;
        const body = req.body;

        settings.minecraftStatsOn = body.minecraftStatsOn === 'on';
        if (body.minecraftIp) settings.minecraftIp = body.minecraftIp;
        if (body.minecraftPort) settings.minecraftPort = parseInt(body.minecraftPort);
        if (body.minecraftIpChannelId) settings.minecraftIpChannelId = body.minecraftIpChannelId;
        if (body.minecraftPortChannelId) settings.minecraftPortChannelId = body.minecraftPortChannelId;
        if (body.minecraftStatusChannelId) settings.minecraftStatusChannelId = body.minecraftStatusChannelId;
        if (body.minecraftPlayersChannelId) settings.minecraftPlayersChannelId = body.minecraftPlayersChannelId;

        await settings.saveAndUpdateCache('guildId');
        res.redirect(`/dashboard/${req.guild.id}/settings/minecraft?success=true`);
    } catch (error) {
        console.error('Error saving minecraft settings:', error);
        res.redirect(`/dashboard/${req.guild.id}/settings/minecraft?error=true`);
    }
});

router.post('/dashboard/:guildId/settings/cooldown', isAuthorized, checkServerAccess, async (req, res) => {
    try {
        const settings = req.settings;
        const body = req.body;

        if (body.dailyCooldown) settings.dailyCooldown = parseInt(body.dailyCooldown);
        if (body.begCooldown) settings.begCooldown = parseInt(body.begCooldown);
        if (body.lootboxCooldown) settings.lootboxCooldown = parseInt(body.lootboxCooldown);
        if (body.workCooldown) settings.workCooldown = parseInt(body.workCooldown);
        if (body.robCooldown) settings.robCooldown = parseInt(body.robCooldown);
        if (body.hackCooldown) settings.hackCooldown = parseInt(body.hackCooldown);
        if (body.petCooldown) settings.petCooldown = parseInt(body.petCooldown);
        if (body.gachaCooldown) settings.gachaCooldown = parseInt(body.gachaCooldown);

        await settings.saveAndUpdateCache('guildId');
        res.redirect(`/dashboard/${req.guild.id}/settings/cooldown?success=true`);
    } catch (error) {
        console.error('Error saving cooldown settings:', error);
        res.redirect(`/dashboard/${req.guild.id}/settings/cooldown?error=true`);
    }
});

router.post('/dashboard/:guildId/settings/language', isAuthorized, checkServerAccess, async (req, res) => {
    try {
        const settings = req.settings;
        const body = req.body;

        if (body.lang) settings.lang = body.lang;

        await settings.saveAndUpdateCache('guildId');
        res.redirect(`/dashboard/${req.guild.id}/settings/language?success=true`);
    } catch (error) {
        console.error('Error saving language settings:', error);
        res.redirect(`/dashboard/${req.guild.id}/settings/language?error=true`);
    }
});

router.post('/dashboard/:guildId/settings/testimony', isAuthorized, checkServerAccess, async (req, res) => {
    try {
        const settings = req.settings;
        const body = req.body;

        if (body.testimonyChannelId) settings.testimonyChannelId = body.testimonyChannelId;
        if (body.feedbackChannelId) settings.feedbackChannelId = body.feedbackChannelId;
        if (body.testimonyCountChannelId) settings.testimonyCountChannelId = body.testimonyCountChannelId;
        if (body.testimonyCountFormat) settings.testimonyCountFormat = body.testimonyCountFormat;
        if (body.testimonyCount) settings.testimonyCount = parseInt(body.testimonyCount);

        await settings.saveAndUpdateCache('guildId');
        res.redirect(`/dashboard/${req.guild.id}/settings/testimony?success=true`);
    } catch (error) {
        console.error('Error saving testimony settings:', error);
        res.redirect(`/dashboard/${req.guild.id}/settings/testimony?error=true`);
    }
});

router.post('/dashboard/:guildId/settings/ai', isAuthorized, checkServerAccess, async (req, res) => {
    try {
        const settings = req.settings;
        const body = req.body;

        // Handle AI channel IDs
        if (body.aiChannelIds !== undefined) {
            const aiChannelIdsArray = Array.isArray(body.aiChannelIds) ? body.aiChannelIds : [body.aiChannelIds];
            settings.aiChannelIds = aiChannelIdsArray.filter((item) => item && item.trim() !== '');
        }

        await settings.saveAndUpdateCache('guildId');
        res.redirect(`/dashboard/${req.guild.id}/settings/ai?success=true`);
    } catch (error) {
        console.error('Error saving AI settings:', error);
        res.redirect(`/dashboard/${req.guild.id}/settings/ai?error=true`);
    }
});

router.post('/dashboard/:guildId/settings/streak', isAuthorized, checkServerAccess, async (req, res) => {
    try {
        const settings = req.settings;
        const body = req.body;

        settings.streakOn = body.streakOn === 'on';
        if (body.streakEmoji) settings.streakEmoji = body.streakEmoji;
        if (body.streakMinimum) settings.streakMinimum = parseInt(body.streakMinimum);

        // Handle streak role rewards
        if (body.streakRoleRewards !== undefined) {
            let rawRewards = body.streakRoleRewards;
            try {
                if (typeof rawRewards === 'string') {
                    rawRewards = JSON.parse(rawRewards || '[]');
                }
            } catch (_) {
                rawRewards = [];
            }

            if (!Array.isArray(rawRewards) && rawRewards && typeof rawRewards === 'object') {
                rawRewards = Object.values(rawRewards);
            }

            settings.streakRoleRewards = Array.isArray(rawRewards)
                ? rawRewards.filter(Boolean).map((item) => ({
                      streak: parseInt(item.streak) || 1,
                      role: item.role || item.roleId || '',
                  }))
                : [];
        }

        await settings.saveAndUpdateCache('guildId');
        res.redirect(`/dashboard/${req.guild.id}/settings/streak?success=true`);
    } catch (error) {
        console.error('Error saving streak settings:', error);
        res.redirect(`/dashboard/${req.guild.id}/settings/streak?error=true`);
    }
});

router.post('/dashboard/:guildId/settings/channels', isAuthorized, checkServerAccess, async (req, res) => {
    try {
        const settings = req.settings;
        const body = req.body;

        if (body.announcementChannelId) settings.announcementChannelId = body.announcementChannelId;
        if (body.inviteChannelId) settings.inviteChannelId = body.inviteChannelId;

        await settings.saveAndUpdateCache('guildId');
        res.redirect(`/dashboard/${req.guild.id}/settings/channels?success=true`);
    } catch (error) {
        console.error('Error saving channel settings:', error);
        res.redirect(`/dashboard/${req.guild.id}/settings/channels?error=true`);
    }
});

router.post('/dashboard/:guildId/settings/features', isAuthorized, checkServerAccess, async (req, res) => {
    try {
        const settings = req.settings;
        const body = req.body;

        const featureKeys = [
            'antiInviteOn',
            'antiLinkOn',
            'antiSpamOn',
            'antiBadwordOn',
            'antiMentionOn',
            'serverStatsOn',
            'adventureOn',
            'levelingOn',
            'welcomeInOn',
            'welcomeOutOn',
            'minecraftStatsOn',
            'streakOn',
            'invitesOn',
            'rolePrefixOn',
        ];

        for (const key of featureKeys) {
            settings[key] = body[key] === 'on';
        }

        await settings.saveAndUpdateCache('guildId');
        res.redirect(`/dashboard/${req.guild.id}/settings/features?success=true`);
    } catch (error) {
        console.error('Error saving features:', error);
        res.redirect(`/dashboard/${req.guild.id}/settings/features?error=true`);
    }
});

module.exports = router;
