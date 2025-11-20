/**
 * @namespace: addons/dashboard/web/routes/settings.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const router = require('express').Router();
const { isAuthorized, checkServerAccess, renderDash } = require('../helpers');

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

router.get('/dashboard/:guildId/settings/booster', isAuthorized, checkServerAccess, (req, res) => {
    const guild = req.guild;
    const channels = {
        text: guild.channels.cache.filter((c) => c.type === 0).toJSON(),
    };

    renderDash(res, 'settings/booster', {
        guild: guild,
        guildId: guild.id,
        user: req.user,
        settings: req.settings,
        channels: channels,
        page: 'settings/booster',
        title: 'Booster Settings',
        currentPage: '/dashboard/settings/booster',
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

// --- POST ROUTES ---

router.post('/dashboard/:guildId/settings/automod', isAuthorized, checkServerAccess, async (req, res) => {
    try {
        const settings = req.settings;
        const body = req.body;

        settings.antiInviteOn = body.antiInviteOn === 'on';
        settings.antiLinkOn = body.antiLinkOn === 'on';
        settings.antiSpamOn = body.antiSpamOn === 'on';
        settings.antiBadwordOn = body.antiBadwordOn === 'on';
        settings.antiMentionOn = body.antiMentionOn === 'on';
        settings.antiAllCapsOn = body.antiAllCapsOn === 'on';
        settings.antiEmojiSpamOn = body.antiEmojiSpamOn === 'on';
        settings.antiZalgoOn = body.antiZalgoOn === 'on';

        if ('modLogChannelId' in body) settings.modLogChannelId = body.modLogChannelId;
        if ('auditLogChannelId' in body) settings.auditLogChannelId = body.auditLogChannelId;

        if ('whitelist' in body) {
            const arr = Array.isArray(body.whitelist) ? body.whitelist : [body.whitelist];
            settings.whitelist = arr.filter((item) => typeof item === "string" ? item.trim() !== '' : !!item);
        }
        if ('badwords' in body) {
            const arr = Array.isArray(body.badwords) ? body.badwords : [body.badwords];
            settings.badwords = arr.filter((item) => typeof item === "string" ? item.trim() !== '' : !!item);
        }
        if ('badwordWhitelist' in body) {
            const arr = Array.isArray(body.badwordWhitelist) ? body.badwordWhitelist : [body.badwordWhitelist];
            settings.badwordWhitelist = arr.filter((item) => typeof item === "string" ? item.trim() !== '' : !!item);
        }
        if ('ignoredChannels' in body) {
            const arr = Array.isArray(body.ignoredChannels) ? body.ignoredChannels : [body.ignoredChannels];
            settings.ignoredChannels = arr.filter((item) => typeof item === "string" ? item.trim() !== '' : !!item);
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

        settings.serverStatsOn = body.serverStatsOn === 'on';
        if ('serverStatsCategoryId' in body) settings.serverStatsCategoryId = body.serverStatsCategoryId;

        if ('serverStats' in body) {
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

        settings.welcomeOutOn = body.welcomeOutOn === 'on';
        if ('welcomeOutChannelId' in body) settings.welcomeOutChannelId = body.welcomeOutChannelId;
        if ('welcomeOutBackgroundUrl' in body) settings.welcomeOutBackgroundUrl = body.welcomeOutBackgroundUrl;
        if ('welcomeOutText' in body) settings.welcomeOutText = body.welcomeOutText;

        await settings.saveAndUpdateCache('guildId');
        res.redirect(`/dashboard/${req.guild.id}/settings/stats?success=true`);
    } catch (error) {
        console.error('Error saving stats settings:', error);
        res.redirect(`/dashboard/${req.guild.id}/settings/stats?error=true`);
    }
});

// ================== PATCHED WELCOME HANDLING ======================

const assignField = (obj, key, value, isNumber = false) => {
    if (isNumber) {
        // Perlu cek biar 0 juga valid, null NaN jadi null (hapus).
        obj[key] = value === '' || value === null || value === undefined ? null : parseInt(value);
    } else {
        obj[key] = value;
    }
};

router.post('/dashboard/:guildId/settings/welcome', isAuthorized, checkServerAccess, async (req, res) => {
    try {
        const settings = req.settings;
        const body = req.body;

        // Channel/Role id fields
        if ('welcomeInChannelId' in body) settings.welcomeInChannelId = body.welcomeInChannelId;
        if ('welcomeOutChannelId' in body) settings.welcomeOutChannelId = body.welcomeOutChannelId;
        if ('welcomeRoleId' in body) settings.welcomeRoleId = body.welcomeRoleId;

        // Text fields. Harus save even if empty string
        if ('welcomeInText' in body) settings.welcomeInText = body.welcomeInText;
        if ('welcomeOutText' in body) settings.welcomeOutText = body.welcomeOutText;

        if ('welcomeInBackgroundUrl' in body) settings.welcomeInBackgroundUrl = body.welcomeInBackgroundUrl;
        if ('welcomeOutBackgroundUrl' in body) settings.welcomeOutBackgroundUrl = body.welcomeOutBackgroundUrl;

        settings.welcomeInOn = body.welcomeInOn === 'on';
        settings.welcomeOutOn = body.welcomeOutOn === 'on';

        // In banner
        if ('welcomeInBannerWidth' in body) assignField(settings, 'welcomeInBannerWidth', body.welcomeInBannerWidth, true);
        if ('welcomeInBannerHeight' in body) assignField(settings, 'welcomeInBannerHeight', body.welcomeInBannerHeight, true);
        if ('welcomeInForegroundUrl' in body) settings.welcomeInForegroundUrl = body.welcomeInForegroundUrl;
        if ('welcomeInOverlayColor' in body) settings.welcomeInOverlayColor = body.welcomeInOverlayColor;

        settings.welcomeInAvatarEnabled = body.welcomeInAvatarEnabled === 'on';
        if ('welcomeInAvatarSize' in body) assignField(settings, 'welcomeInAvatarSize', body.welcomeInAvatarSize, true);
        if ('welcomeInAvatarShape' in body) settings.welcomeInAvatarShape = body.welcomeInAvatarShape;
        if ('welcomeInAvatarYOffset' in body) assignField(settings, 'welcomeInAvatarYOffset', body.welcomeInAvatarYOffset, true);
        if ('welcomeInAvatarBorderWidth' in body) assignField(settings, 'welcomeInAvatarBorderWidth', body.welcomeInAvatarBorderWidth, true);
        if ('welcomeInAvatarBorderColor' in body) settings.welcomeInAvatarBorderColor = body.welcomeInAvatarBorderColor;

        if ('welcomeInMainTextContent' in body) settings.welcomeInMainTextContent = body.welcomeInMainTextContent;
        if ('welcomeInMainTextFont' in body) settings.welcomeInMainTextFont = body.welcomeInMainTextFont;
        if ('welcomeInMainTextFontFamily' in body) settings.welcomeInMainTextFontFamily = body.welcomeInMainTextFontFamily;
        if ('welcomeInMainTextColor' in body) settings.welcomeInMainTextColor = body.welcomeInMainTextColor;
        if ('welcomeInMainTextYOffset' in body) assignField(settings, 'welcomeInMainTextYOffset', body.welcomeInMainTextYOffset, true);

        if ('welcomeInSubTextContent' in body) settings.welcomeInSubTextContent = body.welcomeInSubTextContent;
        if ('welcomeInSubTextFont' in body) settings.welcomeInSubTextFont = body.welcomeInSubTextFont;
        if ('welcomeInSubTextFontFamily' in body) settings.welcomeInSubTextFontFamily = body.welcomeInSubTextFontFamily;
        if ('welcomeInSubTextColor' in body) settings.welcomeInSubTextColor = body.welcomeInSubTextColor;
        if ('welcomeInSubTextYOffset' in body) assignField(settings, 'welcomeInSubTextYOffset', body.welcomeInSubTextYOffset, true);

        if ('welcomeInShadowColor' in body) settings.welcomeInShadowColor = body.welcomeInShadowColor;
        if ('welcomeInShadowBlur' in body) assignField(settings, 'welcomeInShadowBlur', body.welcomeInShadowBlur, true);

        if ('welcomeInBorderColor' in body) settings.welcomeInBorderColor = body.welcomeInBorderColor;
        if ('welcomeInBorderWidth' in body) assignField(settings, 'welcomeInBorderWidth', body.welcomeInBorderWidth, true);

        if ('welcomeInExtraDraw' in body) settings.welcomeInExtraDraw = body.welcomeInExtraDraw;

        // Out fields:
        if ('welcomeOutBannerWidth' in body) assignField(settings, 'welcomeOutBannerWidth', body.welcomeOutBannerWidth, true);
        if ('welcomeOutBannerHeight' in body) assignField(settings, 'welcomeOutBannerHeight', body.welcomeOutBannerHeight, true);
        if ('welcomeOutForegroundUrl' in body) settings.welcomeOutForegroundUrl = body.welcomeOutForegroundUrl;
        if ('welcomeOutOverlayColor' in body) settings.welcomeOutOverlayColor = body.welcomeOutOverlayColor;

        settings.welcomeOutAvatarEnabled = body.welcomeOutAvatarEnabled === 'on';
        if ('welcomeOutAvatarSize' in body) assignField(settings, 'welcomeOutAvatarSize', body.welcomeOutAvatarSize, true);
        if ('welcomeOutAvatarShape' in body) settings.welcomeOutAvatarShape = body.welcomeOutAvatarShape;
        if ('welcomeOutAvatarYOffset' in body) assignField(settings, 'welcomeOutAvatarYOffset', body.welcomeOutAvatarYOffset, true);
        if ('welcomeOutAvatarBorderWidth' in body) assignField(settings, 'welcomeOutAvatarBorderWidth', body.welcomeOutAvatarBorderWidth, true);
        if ('welcomeOutAvatarBorderColor' in body) settings.welcomeOutAvatarBorderColor = body.welcomeOutAvatarBorderColor;

        if ('welcomeOutMainTextContent' in body) settings.welcomeOutMainTextContent = body.welcomeOutMainTextContent;
        if ('welcomeOutMainTextFont' in body) settings.welcomeOutMainTextFont = body.welcomeOutMainTextFont;
        if ('welcomeOutMainTextFontFamily' in body) settings.welcomeOutMainTextFontFamily = body.welcomeOutMainTextFontFamily;
        if ('welcomeOutMainTextColor' in body) settings.welcomeOutMainTextColor = body.welcomeOutMainTextColor;
        if ('welcomeOutMainTextYOffset' in body) assignField(settings, 'welcomeOutMainTextYOffset', body.welcomeOutMainTextYOffset, true);

        if ('welcomeOutSubTextContent' in body) settings.welcomeOutSubTextContent = body.welcomeOutSubTextContent;
        if ('welcomeOutSubTextFont' in body) settings.welcomeOutSubTextFont = body.welcomeOutSubTextFont;
        if ('welcomeOutSubTextFontFamily' in body) settings.welcomeOutSubTextFontFamily = body.welcomeOutSubTextFontFamily;
        if ('welcomeOutSubTextColor' in body) settings.welcomeOutSubTextColor = body.welcomeOutSubTextColor;
        if ('welcomeOutSubTextYOffset' in body) assignField(settings, 'welcomeOutSubTextYOffset', body.welcomeOutSubTextYOffset, true);

        if ('welcomeOutShadowColor' in body) settings.welcomeOutShadowColor = body.welcomeOutShadowColor;
        if ('welcomeOutShadowBlur' in body) assignField(settings, 'welcomeOutShadowBlur', body.welcomeOutShadowBlur, true);

        if ('welcomeOutBorderColor' in body) settings.welcomeOutBorderColor = body.welcomeOutBorderColor;
        if ('welcomeOutBorderWidth' in body) assignField(settings, 'welcomeOutBorderWidth', body.welcomeOutBorderWidth, true);

        if ('welcomeOutExtraDraw' in body) settings.welcomeOutExtraDraw = body.welcomeOutExtraDraw;

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
        if ('levelingChannelId' in body) settings.levelingChannelId = body.levelingChannelId;
        if ('levelingCooldown' in body)
            settings.levelingCooldown = body.levelingCooldown === '' || body.levelingCooldown === null || body.levelingCooldown === undefined
                ? null
                : parseInt(body.levelingCooldown) * 1000;
        if ('levelingXp' in body)
            settings.levelingXp = body.levelingXp === '' || body.levelingXp === null || body.levelingXp === undefined
                ? null
                : parseInt(body.levelingXp);

        if ('roleRewards' in body) {
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
                      level: item && ('level' in item) ? (item.level === '' || item.level == null ? 1 : parseInt(item.level)) : 1,
                      role: item && ('role' in item) ? (item.role || item.roleId || '') : '',
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
        if ('minecraftIp' in body) settings.minecraftIp = body.minecraftIp;
        if ('minecraftPort' in body)
            settings.minecraftPort = body.minecraftPort === '' || body.minecraftPort === null || body.minecraftPort === undefined
                ? null : parseInt(body.minecraftPort);
        if ('minecraftIpChannelId' in body) settings.minecraftIpChannelId = body.minecraftIpChannelId;
        if ('minecraftPortChannelId' in body) settings.minecraftPortChannelId = body.minecraftPortChannelId;
        if ('minecraftStatusChannelId' in body) settings.minecraftStatusChannelId = body.minecraftStatusChannelId;
        if ('minecraftPlayersChannelId' in body) settings.minecraftPlayersChannelId = body.minecraftPlayersChannelId;

        await settings.saveAndUpdateCache('guildId');
        res.redirect(`/dashboard/${req.guild.id}/settings/minecraft?success=true`);
    } catch (error) {
        console.error('Error saving minecraft settings:', error);
        res.redirect(`/dashboard/${req.guild.id}/settings/minecraft?error=true`);
    }
});

router.post('/dashboard/:guildId/settings/language', isAuthorized, checkServerAccess, async (req, res) => {
    try {
        const settings = req.settings;
        const body = req.body;

        if ('lang' in body) settings.lang = body.lang;

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

        if ('testimonyChannelId' in body) settings.testimonyChannelId = body.testimonyChannelId;
        if ('feedbackChannelId' in body) settings.feedbackChannelId = body.feedbackChannelId;
        if ('testimonyCountChannelId' in body) settings.testimonyCountChannelId = body.testimonyCountChannelId;
        if ('testimonyCountFormat' in body) settings.testimonyCountFormat = body.testimonyCountFormat;
        if ('testimonyCount' in body)
            settings.testimonyCount = body.testimonyCount === '' || body.testimonyCount == null
                ? null : parseInt(body.testimonyCount);

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

        if ('aiChannelIds' in body) {
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
        if ('streakEmoji' in body) settings.streakEmoji = body.streakEmoji;
        if ('streakMinimum' in body)
            settings.streakMinimum = body.streakMinimum === '' || body.streakMinimum == null 
                ? null : parseInt(body.streakMinimum);

        if ('streakRoleRewards' in body) {
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
                      streak: item && ('streak' in item) ? (item.streak === '' || item.streak == null ? 1 : parseInt(item.streak)) : 1,
                      role: item && ('role' in item) ? (item.role || item.roleId || '') : '',
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

        if ('announcementChannelId' in body) settings.announcementChannelId = body.announcementChannelId;
        if ('inviteChannelId' in body) settings.inviteChannelId = body.inviteChannelId;

        await settings.saveAndUpdateCache('guildId');
        res.redirect(`/dashboard/${req.guild.id}/settings/channels?success=true`);
    } catch (error) {
        console.error('Error saving channel settings:', error);
        res.redirect(`/dashboard/${req.guild.id}/settings/channels?error=true`);
    }
});

router.post('/dashboard/:guildId/settings/booster', isAuthorized, checkServerAccess, async (req, res) => {
    try {
        const settings = req.settings;
        const body = req.body;

        settings.boostLogOn = body.boostLogOn === 'on';
        if ('boostLogChannelId' in body) settings.boostLogChannelId = body.boostLogChannelId;
        if ('boostLogMessage' in body) settings.boostLogMessage = body.boostLogMessage;

        await settings.saveAndUpdateCache('guildId');
        res.redirect(`/dashboard/${req.guild.id}/settings/booster?success=true`);
    } catch (error) {
        console.error('Error saving booster settings:', error);
        res.redirect(`/dashboard/${req.guild.id}/settings/booster?error=true`);
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
            'antiAllCapsOn',
            'antiEmojiSpamOn',
            'antiZalgoOn',
            'serverStatsOn',
            'adventureOn',
            'levelingOn',
            'welcomeInOn',
            'welcomeOutOn',
            'minecraftStatsOn',
            'streakOn',
            'invitesOn',
            'rolePrefixOn',
            'boostLogOn',
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
