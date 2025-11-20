/**
 * @namespace: addons/core/helpers/automod.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { Collection, PermissionsBitField } = require('discord.js');
const ServerSetting = require('@coreModels/ServerSetting');
const { sendLogsWarning } = require('./system');
const { t } = require('@coreHelpers/translator');
const logger = require('@coreHelpers/logger');
const leetMap = require('./leetMap');

const userCache = new Collection();
const SPAM_THRESHOLD = kythia.settings.spamThreshold || 5;
const DUPLICATE_THRESHOLD = kythia.settings.duplicateThreshold || 3;
const MENTION_THRESHOLD = kythia.settings.mentionThreshold || 3;
const FAST_TIME_WINDOW = kythia.settings.fastTimeWindow || 40 * 1000;
const DUPLICATE_TIME_WINDOW = kythia.settings.duplicateTimeWindow || 15 * 60 * 1000;
const CACHE_EXPIRATION_TIME = kythia.settings.cacheExpirationTime || 15 * 60 * 1000;
const PUNISHMENT_COOLDOWN = kythia.settings.punishmentCooldown || 1 * 1000;
const SHORT_MESSAGE_THRESHOLD = kythia.settings.shortMessageThreshold || 5;

const ALL_CAPS_MIN_LENGTH = kythia.settings.antiAllCapsMinLength || 15;
const ALL_CAPS_RATIO = kythia.settings.antiAllCapsRatio || 0.7;
const ANTI_EMOJI_MIN_TOTAL = kythia.settings.antiEmojiMinTotal || 11;
const ANTI_EMOJI_RATIO = kythia.settings.antiEmojiRatio || 0.8;
const ANTI_ZALGO_MIN = kythia.settings.antiZalgoMin || 8;

const reverseLeetMap = new Map();
for (const [baseChar, variations] of Object.entries(leetMap)) {
    for (const variation of variations) {
        reverseLeetMap.set(variation, baseChar);
    }
}

function normalizeText(text) {
    if (!text) return '';

    const lowerText = text.toLowerCase();
    let normalized = '';

    for (let i = 0; i < lowerText.length; i++) {
        const char = lowerText[i];
        normalized += reverseLeetMap.get(char) || char;
    }

    return normalized.replace(/[^a-z0-9]+/g, ' ').trim();
}

function canDeleteMessage(message) {
    if (!message.guild || !message.guild.members.me) return false;
    const me = message.guild.members.me;
    const channel = message.channel;
    if (!channel.permissionsFor(me).has(PermissionsBitField.Flags.ViewChannel)) return false;
    if (!channel.permissionsFor(me).has(PermissionsBitField.Flags.ManageMessages)) return false;
    return true;
}

async function automodSystem(message) {
    if (message.author.bot || !message.guild) return;

    const { guild, author: user, member } = message;

    const setting = await ServerSetting.getCache({ guildId: guild.id });
    if (!setting) return;

    if (setting.ignoredChannels?.includes(message.channel.id)) return;
    if (setting.whitelist?.includes(user.id) || member.roles.cache.some((r) => setting.whitelist?.includes(r.id))) return;

    await checkUsername(message, setting);

    let isFlagged = await checkSpam(message, setting);
    if (isFlagged) return true;

    isFlagged = await checkBadwords(message, setting);
    if (isFlagged) return true;

    isFlagged = await checkMentions(message, setting);
    if (isFlagged) return true;

    isFlagged = await checkLinks(message, setting);
    if (isFlagged) return true;

    isFlagged = await checkAllCaps(message, setting);
    if (isFlagged) return true;

    isFlagged = await checkEmojiSpam(message, setting);
    if (isFlagged) return true;

    isFlagged = await checkZalgo(message, setting);
    if (isFlagged) return true;
}

async function checkSpam(message, setting) {
    if (!setting.antiSpamOn) return false;

    const now = Date.now();
    const key = `${message.guild.id}-${message.author.id}`;
    let userData = userCache.get(key) || { fastMessages: [], duplicateMessages: [], violations: 0, isPunished: false, lastPunishment: 0 };
    userData.lastActivity = now;

    if (userData.violations > 0 && now - userData.lastPunishment > DUPLICATE_TIME_WINDOW) {
        logger.info(`🛡️ Reseting violation for user ${message.author.id}.`);
        userData.violations = 0;
    }

    if (userData.isPunished && now - userData.lastPunishment < PUNISHMENT_COOLDOWN) return false;

    if (userData.isPunished) {
        userData.isPunished = false;
    }

    userData.fastMessages.push(message);
    userData.fastMessages = userData.fastMessages.filter((msg) => now - msg.createdTimestamp < FAST_TIME_WINDOW);

    userData.duplicateMessages.push(message);
    userData.duplicateMessages = userData.duplicateMessages.filter((msg) => now - msg.createdTimestamp < DUPLICATE_TIME_WINDOW);

    let spamType = null;
    let messagesToDelete = [];

    const content = message.content.toLowerCase();
    const duplicateMessages = userData.duplicateMessages.filter((m) => m.content.toLowerCase() === content);

    if (duplicateMessages.length >= DUPLICATE_THRESHOLD) {
        spamType = 'duplicate';
        messagesToDelete = [...duplicateMessages];
    }

    if (!spamType && userData.fastMessages.length >= SPAM_THRESHOLD) {
        spamType = 'fast';
        messagesToDelete = [...userData.fastMessages];
    }

    if (!spamType && userData.fastMessages.filter((m) => m.content.length > 0 && m.content.length <= 5).length >= SHORT_MESSAGE_THRESHOLD) {
        spamType = 'short';
        messagesToDelete = [...userData.fastMessages.filter((m) => m.content.length > 0 && m.content.length <= 5)];
    }

    if (spamType) {
        let reasonKey = '';
        if (spamType === 'duplicate') reasonKey = 'core.system.automod.spam.duplicate';
        else if (spamType === 'fast') reasonKey = 'core.system.automod.spam.fast';
        else if (spamType === 'short') reasonKey = 'core.system.automod.spam.short';
        else reasonKey = 'core.system.automod.spam.generic';

        const reason = await t(message, reasonKey);

        for (const msg of messagesToDelete) {
            if (canDeleteMessage(msg)) {
                msg.delete().catch((err) => {
                    if (err.code !== 50013) {
                        logger.error('Failed to delete spam message:', err);
                    }
                });
            }
        }

        userData.violations++;
        userData.isPunished = true;
        userData.lastPunishment = now;

        sendLogsWarning(message, reason, message.content, setting);

        const timeoutDuration = Math.min(userData.violations * 180, 1800);
        if (message.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            message.member.timeout(timeoutDuration * 1000, reason).catch((err) => {
                if (err.code !== 50013) {
                    logger.error('Failed to timeout member:', err);
                }
            });
        }

        if (spamType === 'duplicate') {
            userData.duplicateMessages = [];
        }

        userData.fastMessages = [];
        userCache.set(key, userData);
        return true;
    }

    userCache.set(key, userData);
    return false;
}

async function checkAllCaps(message, setting) {
    if (!setting.antiAllCapsOn) return false;

    const raw = message.content || '';
    if (raw.length < ALL_CAPS_MIN_LENGTH) return false;

    const chars = [...raw].filter((c) => c.match(/[A-Za-z]/));
    if (chars.length < ALL_CAPS_MIN_LENGTH) return false;

    const upper = chars.filter((c) => c === c.toUpperCase() && c !== c.toLowerCase());
    const capRatio = upper.length / chars.length;

    if (capRatio >= ALL_CAPS_RATIO) {
        const reason = await t(message, 'core.helpers.automod.system.automod.capslock.detected');
        sendLogsWarning(message, reason, message.content, setting);
        if (canDeleteMessage(message)) {
            message.delete().catch((err) => {
                if (err.code !== 50013) logger.error('Failed to delete ALL CAPS message:', err);
            });
        }
        return true;
    }
    return false;
}

function _countEmojis(str) {
    const unicodeEmojiRegex =
        /(?:[\u203C-\u3299]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDD00-\uDDFF]|\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
    const customEmojiRegex = /<a?:\w+:\d+>/g;
    let unicodeMatch = str.match(unicodeEmojiRegex) || [];
    let customMatch = str.match(customEmojiRegex) || [];
    return {
        total: unicodeMatch.length + customMatch.length,
        ratio: (unicodeMatch.length + customMatch.length) / Math.max(str.length, 1),
    };
}

async function checkEmojiSpam(message, setting) {
    if (!setting.antiEmojiSpamOn) return false;

    const raw = message.content || '';
    if (!raw || raw.length < 3) return false;

    const { total, ratio } = _countEmojis(raw);

    if (total >= ANTI_EMOJI_MIN_TOTAL || ratio >= ANTI_EMOJI_RATIO) {
        const reason = await t(message, 'core.helpers.automod.system.automod.emojispam.detected');
        sendLogsWarning(message, reason, message.content, setting);

        if (canDeleteMessage(message)) {
            message.delete().catch((err) => {
                if (err.code !== 50013) logger.error('Failed to delete emoji spam message:', err);
            });
        }
        return true;
    }
    return false;
}

function _countZalgo(str) {
    const reg = /[\u0300-\u036f]/g;
    const matches = str.match(reg);
    return matches ? matches.length : 0;
}

async function checkZalgo(message, setting) {
    if (!setting.antiZalgoOn) return false;

    const raw = message.content || '';

    if (!raw || raw.length < 6) return false;

    const count = _countZalgo(raw);
    if (count >= ANTI_ZALGO_MIN) {
        const reason = await t(message, 'core.helpers.automod.system.automod.zalgo.detected');
        sendLogsWarning(message, reason, message.content, setting);

        if (canDeleteMessage(message)) {
            message.delete().catch((err) => {
                if (err.code !== 50013) logger.error('Failed to delete zalgo message:', err);
            });
        }
        return true;
    }
    return false;
}

async function checkBadwords(message, setting) {
    if (!setting.antiBadwordOn) return false;

    const rawBadwords = Array.isArray(setting.badwords)
        ? setting.badwords
        : typeof setting.badwords === 'string' && setting.badwords.trim().length > 0
          ? setting.badwords.split(',')
          : [];
    const badwords = rawBadwords.map((w) => w.trim().toLowerCase()).filter(Boolean);

    if (badwords.length === 0) return false;

    const escapeRegex = (str) => str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

    const normalizedBadwords = badwords.map((w) => {
        const normalized = normalizeText(w);

        const coreWord = normalized.replace(/\s+/g, '');

        return coreWord.split('').map(escapeRegex).join('+\\s*') + '+';
    });

    const badwordRegex = new RegExp(`\\b(${normalizedBadwords.join('|')})\\b`, 'i');

    const contentToCheck = [
        message.content,
        ...message.embeds.flatMap((e) => [e.title, e.description]),
        ...message.attachments.map((a) => a.name),
    ]
        .filter(Boolean)
        .join(' ');

    if (!contentToCheck) return false;

    const normalizedContent = normalizeText(contentToCheck).toLowerCase();

    const match = normalizedContent.match(badwordRegex);

    if (match) {
        const foundBadword = match[0];
        const reason = await t(message, 'core.helpers.automod.system.automod.badword.detected', { word: foundBadword });
        sendLogsWarning(message, reason, foundBadword, setting);

        if (canDeleteMessage(message)) {
            message.delete().catch(() => {});
        }
        return true;
    }

    return false;
}

async function checkMentions(message, setting) {
    if (!setting.antiMentionOn) return false;

    const mentionRegex = /<@!?[0-9]+>|<@&[0-9]+>|@everyone|@here|[\uFF20][eE][vV][eE][rR][yY][oO][nN][eE]|[\uFF20][hH][eE][rR][eE]/g;
    const mentionCount =
        message.mentions.users.size +
        message.mentions.roles.size +
        (message.mentions.everyone ? 1 : 0) +
        (message.mentions.here ? 1 : 0) +
        (message.content.match(mentionRegex) || []).length;

    if (mentionCount >= MENTION_THRESHOLD) {
        const reason = await t(message, 'core.helpers.automod.system.automod.mention.spam');
        sendLogsWarning(message, reason, message.content, setting);
        if (canDeleteMessage(message)) {
            message.delete().catch((err) => {
                if (err.code !== 50013) {
                    logger.error('Failed to delete mention spam message:', err);
                }
            });
        }
        return true;
    }
    return false;
}

async function checkUsername(message, setting) {
    const { author, member, guild } = message;

    const lastCheckKey = `namecheck-${guild.id}-${author.id}`;
    const lastCheck = userCache.get(lastCheckKey);
    if (lastCheck && Date.now() - lastCheck < 24 * 60 * 60 * 1000) {
        return false;
    }

    const badwords = Array.isArray(setting.badwords) ? setting.badwords.map((w) => w.trim().toLowerCase()).filter(Boolean) : [];

    if (badwords.length === 0) return false;

    const escapeRegex = (str) => str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const normalizedBadwords = badwords.map((word) => escapeRegex(normalizeText(word)));
    const badwordRegex = new RegExp(`\\b(${normalizedBadwords.join('|')})\\b`, 'i');

    const nameToCheck = normalizeText(`${author.username} ${member?.displayName || ''}`);
    const match = nameToCheck.match(badwordRegex);

    if (match) {
        const foundBadword = match[0];
        const reason = await t(message, 'core.helpers.automod.system.automod.badname.detected', { word: foundBadword });

        sendLogsWarning(message, reason, `${author.username} | ${member?.displayName}`, setting);

        const userData = userCache.get(lastCheckKey) || {};
        userData.lastCheck = Date.now();
        userCache.set(lastCheckKey, userData);

        return true;
    }

    return false;
}

async function checkLinks(message, setting) {
    const sanitize = (text) => (text || '').replace(/[\s\\\u200B-\u200D\uFEFF\[\]\(\)\{\}\<\>\|`'"\.,;:!~_=\-]/g, '').toLowerCase();

    const inviteCore = [
        'discordapp.com/invite',
        'discord.com/invite',
        'discord.gg',
        'discordapp.gg',
        'dsc.gg',
        'invite.gg',
        'disc.gg',
        'dscrdly.com',
        'discord.me',
        'discord.io',
        'discord.link',
        'discordplus.me',
        'joinmydiscord.com',
    ];

    function obf(s) {
        return s
            .split('')
            .map((c) => `[${c}${c.toUpperCase()}][^a-zA-Z0-9]{0,2}`)
            .join('');
    }
    const inviteRegex = new RegExp(inviteCore.map(obf).join('|') + '[^a-zA-Z0-9]{0,8}[a-z0-9-]{2,}', 'iu');

    const domainRegex =
        /(?:(?:https?:\/\/)?(?:www\.)?)?((?:[a-z0-9\u00a1-\uffff][^a-zA-Z0-9]{0,2}){2,}\.(?:[a-z\u00a1-\uffff]{2,}))(?:\/[^\s]*)?/giu;

    const shorteners = [
        'bit.ly',
        'tinyurl.com',
        'goo.gl',
        't.co',
        'ow.ly',
        'is.gd',
        'buff.ly',
        'cutt.ly',
        'rb.gy',
        'shorte.st',
        'adf.ly',
        'rebrand.ly',
        's.id',
        'v.gd',
        'soo.gd',
        'qr.ae',
        'lnkd.in',
        'db.tt',
        'clck.ru',
        'po.st',
        'bc.vc',
        'x.co',
        'tr.im',
        'mcaf.ee',
        'su.pr',
        'twurl.nl',
        'snipurl.com',
        'shorturl.at',
        'shrtco.de',
        'chilp.it',
        'u.to',
        'j.mp',
        'bddy.me',
        'ity.im',
        'q.gs',
        'viralurl.com',
        'vur.me',
        'lnk.fi',
        'lnk.in',
        'linktr.ee',
        'link.ly',
        'link.to',
        'link.bio',
    ];
    const shortenerRegex = new RegExp(shorteners.map(obf).join('|'), 'iu');

    const sanitizedContent = sanitize(message.content);

    let hasInviteInEmbed = false;
    if (message.embeds?.length) {
        for (const embed of message.embeds) {
            if (
                inviteRegex.test(sanitize(embed.url || '')) ||
                inviteRegex.test(sanitize(embed.description || '')) ||
                inviteRegex.test(sanitize(embed.title || ''))
            ) {
                hasInviteInEmbed = true;
                break;
            }
        }
    }

    let hasInviteInAttachment = false;
    if (message.attachments?.size) {
        for (const att of message.attachments.values()) {
            if (inviteRegex.test(sanitize(att.url || ''))) {
                hasInviteInAttachment = true;
                break;
            }
        }
    }

    let hasLinkInEmbed = false;
    if (message.embeds?.length) {
        for (const embed of message.embeds) {
            if (domainRegex.test(embed.url || '') || domainRegex.test(embed.description || '') || domainRegex.test(embed.title || '')) {
                hasLinkInEmbed = true;
                break;
            }
        }
    }

    let hasLinkInAttachment = false;
    if (setting.antiLinkOn && message.attachments?.size > 0) {
        for (const att of message.attachments.values()) {
            const url = att.url || '';

            const isDiscordCdn = url.startsWith('https://cdn.discordapp.com') || url.startsWith('https://media.discordapp.net');

            if (!isDiscordCdn && domainRegex.test(url)) {
                hasLinkInAttachment = true;
                break;
            }
        }
    }

    let hasShortener = shortenerRegex.test(sanitizedContent);

    if (setting.antiInviteOn && (inviteRegex.test(sanitizedContent) || hasInviteInEmbed || hasInviteInAttachment)) {
        const reason = await t(message, 'core.helpers.automod.system.automod.invite.detected');
        await sendLogsWarning(message, reason, message.content, setting);
        if (canDeleteMessage(message)) {
            return message.delete().catch((err) => {
                if (err.code !== 50013) {
                    logger.error('Failed to delete invite message:', err);
                }
            });
        }
        return true;
    }

    if (setting.antiLinkOn && (domainRegex.test(message.content) || hasLinkInEmbed || hasLinkInAttachment || hasShortener)) {
        const reason = await t(message, 'core.helpers.automod.system.automod.link.detected');
        await sendLogsWarning(message, reason, message.content, setting);
        if (canDeleteMessage(message)) {
            return message.delete().catch((err) => {
                if (err.code !== 50013) {
                    logger.error('Failed to delete link message:', err);
                }
            });
        }
        return true;
    }
    return false;
}

function cleanupCaches() {
    const now = Date.now();
    for (const [key, value] of userCache.entries()) {
        const lastActive = value.lastActivity || value.lastCheck;
        if (lastActive && now - lastActive > CACHE_EXPIRATION_TIME) {
            userCache.delete(key);
        }
    }
    logger.info(`🧹 [CACHE CLEANUP] User cache cleaned. Current size: ${userCache.size}`);
}

setInterval(cleanupCaches, 60 * 60 * 1000);

module.exports = {
    automodSystem,
    userCache,
};
