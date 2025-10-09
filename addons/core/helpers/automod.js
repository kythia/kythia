/**
 * @namespace: addons/core/system/automod.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */

const { Collection, PermissionsBitField } = require('discord.js');
const ServerSetting = require('@coreModels/ServerSetting');
const { sendLogsWarning } = require('./system');
const { t } = require('@utils/translator');
const logger = require('@src/utils/logger');
const userCache = new Collection();
const SPAM_THRESHOLD = kythia.settings.spamThreshold || 5;
const DUPLICATE_THRESHOLD = kythia.settings.duplicateThreshold || 3;
const MENTION_THRESHOLD = kythia.settings.mentionThreshold || 3;
const FAST_TIME_WINDOW = kythia.settings.fastTimeWindow || 40 * 1000; // 40 seconds
const DUPLICATE_TIME_WINDOW = kythia.settings.duplicateTimeWindow || 15 * 60 * 1000; // 15 minutes
const CACHE_EXPIRATION_TIME = kythia.settings.cacheExpirationTime || 15 * 60 * 1000; // 15 minutes
const PUNISHMENT_COOLDOWN = kythia.settings.punishmentCooldown || 1 * 1000; // 1 second

// EXTREMELY DETAILED leet/obfuscation map for maximum strictness
const leetMap = {
    a: [
        'a',
        'A',
        '4',
        '@',
        'à',
        'á',
        'â',
        'ã',
        'ä',
        'å',
        'α',
        'а',
        'æ',
        'ª',
        '∆',
        'Λ',
        '∂',
        'ɑ',
        'ɐ',
        'ᴀ',
        'ꞻ',
        'Ꜳ',
        'Ꞻ',
        '𝔞',
        '𝕒',
        '𝓪',
        '𝖆',
        '𝒶',
        '𝚊',
        '𝑎',
        '𝘢',
        '𝙖',
        '𝔸',
        '𝔄',
        '𝕬',
        '𝓐',
        '𝖠',
        '𝒜',
        '𝙰',
        '𝑨',
        '𝘈',
        '𝙰',
    ],
    b: [
        'b',
        'B',
        '8',
        'ß',
        '฿',
        'β',
        'в',
        '|3',
        '13',
        'I3',
        'ʙ',
        'ḃ',
        'ƀ',
        'þ',
        'Ь',
        'Ꮟ',
        'Ᏼ',
        '𝔟',
        '𝕓',
        '𝓫',
        '𝖇',
        '𝒷',
        '𝚋',
        '𝑏',
        '𝘣',
        '𝙗',
        '𝔹',
        '𝔅',
        '𝕭',
        '𝓑',
        '𝖡',
        'ℬ',
        '𝙱',
        '𝑩',
        '𝘉',
        '𝙱',
    ],
    c: [
        'c',
        'C',
        '(',
        '{',
        '[',
        '<',
        '¢',
        '©',
        'с',
        'ḉ',
        'ċ',
        'ć',
        'ç',
        'Ꮯ',
        'ᑕ',
        '𝔠',
        '𝕔',
        '𝓬',
        '𝖈',
        '𝒸',
        '𝚌',
        '𝑐',
        '𝘤',
        '𝙘',
        'ℂ',
        'ℭ',
        '𝕮',
        '𝓒',
        '𝖢',
        '𝒞',
        '𝙲',
        '𝑪',
        '𝘊',
        '𝙲',
    ],
    d: [
        'd',
        'D',
        'đ',
        'Ð',
        'ԁ',
        'Ԁ',
        'ḋ',
        'ḍ',
        '|)',
        'cl',
        'ď',
        'Ꭰ',
        'ᗪ',
        '𝔡',
        '𝕕',
        '𝓭',
        '𝖉',
        '𝒹',
        '𝚍',
        '𝑑',
        '𝘥',
        '𝙙',
        '𝔻',
        '𝔇',
        '𝕯',
        '𝓓',
        '𝖣',
        '𝒟',
        '𝙳',
        '𝑫',
        '𝘋',
        '𝙳',
    ],
    e: [
        'e',
        'E',
        '3',
        '€',
        'ë',
        'è',
        'é',
        'ê',
        'ē',
        'ė',
        'ę',
        '∑',
        'є',
        '℮',
        'ε',
        'е',
        'ɘ',
        'ǝ',
        'ҽ',
        '𝔢',
        '𝕖',
        '𝓮',
        '𝖊',
        '𝑒',
        '𝚎',
        '𝑒',
        '𝘦',
        '𝙚',
        '𝔼',
        '𝔈',
        '𝕰',
        '𝓔',
        '𝖤',
        'ℰ',
        '𝙴',
        '𝑬',
        '𝘌',
        '𝙴',
    ],
    f: ['f', 'F', 'ƒ', 'ph', 'ғ', 'ḟ', '𝔣', '𝕗', '𝓯', '𝖋', '𝒻', '𝚏', '𝑓', '𝘧', '𝙛', '𝔽', '𝔉', '𝕱', '𝓕', '𝖥', 'ℱ', '𝙵', '𝑭', '𝘍', '𝙵'],
    g: [
        'g',
        'G',
        '9',
        '6',
        'ɢ',
        'ğ',
        'ģ',
        'ǥ',
        'ḡ',
        'ĝ',
        'ǧ',
        'ɠ',
        'ġ',
        '𝔤',
        '𝕘',
        '𝓰',
        '𝖌',
        '𝑔',
        '𝚐',
        '𝑔',
        '𝘨',
        '𝙜',
        '𝔾',
        '𝔊',
        '𝕲',
        '𝓖',
        '𝖦',
        '𝒢',
        '𝙶',
        '𝑮',
        '𝘎',
        '𝙶',
    ],
    h: [
        'h',
        'H',
        '#',
        '|-|',
        'н',
        'ħ',
        'ḩ',
        'ĥ',
        'ḥ',
        'ḫ',
        'н',
        '𝔥',
        '𝕙',
        '𝓱',
        '𝖍',
        '𝒽',
        '𝚑',
        '𝒉',
        '𝘩',
        '𝙝',
        'ℍ',
        'ℋ',
        '𝕳',
        '𝓗',
        '𝖧',
        'ℋ',
        '𝙷',
        '𝑯',
        '𝘏',
        '𝙷',
    ],
    i: [
        'i',
        'I',
        '1',
        '!',
        '|',
        'í',
        'ì',
        'î',
        'ï',
        'ι',
        'і',
        '¡',
        'ɪ',
        'ỉ',
        'ī',
        'į',
        'ı',
        'l',
        'L',
        '𝔦',
        '𝕚',
        '𝓲',
        '𝖎',
        '𝒾',
        '𝚒',
        '𝑖',
        '𝘪',
        '𝙞',
        '𝕀',
        '𝕴',
        '𝓘',
        '𝖨',
        'ℐ',
        '𝙸',
        '𝑰',
        '𝘐',
        '𝙸',
    ],
    j: ['j', 'J', '¿', 'ʝ', 'ј', 'ĵ', '𝔧', '𝕛', '𝓳', '𝖏', '𝒿', '𝚓', '𝑗', '𝘫', '𝙟', '𝕁', '𝕵', '𝓙', '𝖩', '𝒥', '𝙹', '𝑱', '𝘑', '𝙹'],
    k: [
        'k',
        'K',
        '|<',
        '|{',
        'κ',
        'ḱ',
        'ķ',
        'ĸ',
        'к',
        '𝔨',
        '𝕜',
        '𝓴',
        '𝖐',
        '𝓀',
        '𝚔',
        '𝑘',
        '𝘬',
        '𝙠',
        '𝕂',
        '𝕶',
        '𝓚',
        '𝖪',
        '𝒦',
        '𝙺',
        '𝑲',
        '𝘒',
        '𝙺',
    ],
    l: [
        'l',
        'L',
        '1',
        '|',
        '£',
        'ℓ',
        'ł',
        'ι',
        'ا',
        'ļ',
        'ľ',
        'ĺ',
        'ł',
        '𝔩',
        '𝕝',
        '𝓵',
        '𝖑',
        '𝓁',
        '𝚕',
        '𝑙',
        '𝘭',
        '𝙡',
        '𝕃',
        '𝕷',
        '𝓛',
        '𝖫',
        'ℒ',
        '𝙻',
        '𝑳',
        '𝘓',
        '𝙻',
    ],
    m: [
        'm',
        'M',
        'м',
        '|\\/|',
        '/\\/\\',
        'ṃ',
        'ɱ',
        'ḿ',
        'ṁ',
        '𝔪',
        '𝕞',
        '𝓶',
        '𝖒',
        '𝓂',
        '𝚖',
        '𝑚',
        '𝘮',
        '𝙢',
        '𝕄',
        '𝕸',
        '𝓜',
        '𝖬',
        'ℳ',
        '𝙼',
        '𝑴',
        '𝘔',
        '𝙼',
    ],
    n: [
        'n',
        'N',
        'η',
        'ñ',
        'ń',
        'ņ',
        'ň',
        'ŋ',
        'п',
        'и',
        '∩',
        '₪',
        'ɴ',
        '𝔫',
        '𝕟',
        '𝓷',
        '𝖓',
        '𝓃',
        '𝚗',
        '𝑛',
        '𝘯',
        '𝙣',
        'ℕ',
        'ℵ',
        '𝕹',
        '𝓝',
        '𝖭',
        '𝒩',
        '𝙽',
        '𝑵',
        '𝘕',
        '𝙽',
    ],
    o: [
        'o',
        'O',
        '0',
        '*',
        '°',
        'ö',
        'ó',
        'ò',
        'ô',
        'õ',
        'ø',
        'ō',
        'õ',
        'ο',
        'σ',
        'о',
        'օ',
        '¤',
        '∘',
        '○',
        '◯',
        '⭕',
        '𝔬',
        '𝕠',
        '𝓸',
        '𝖔',
        '𝓸',
        '𝚘',
        '𝑜',
        '𝘰',
        '𝙤',
        '𝕆',
        '𝕺',
        '𝓞',
        '𝖮',
        '𝒪',
        '𝙾',
        '𝑶',
        '𝘖',
        '𝙾',
    ],
    p: [
        'p',
        'P',
        'ρ',
        'р',
        'þ',
        '|*',
        '|o',
        '|º',
        '|>',
        '¶',
        '₱',
        'ṕ',
        'ṗ',
        '𝔭',
        '𝕡',
        '𝓹',
        '𝖕',
        '𝓅',
        '𝚙',
        '𝑝',
        '𝘱',
        '𝙥',
        'ℙ',
        '𝕻',
        '𝓟',
        '𝖯',
        '𝒫',
        '𝙿',
        '𝑷',
        '𝘗',
        '𝙿',
    ],
    q: ['q', 'Q', '9', 'φ', 'ϙ', 'զ', 'ǫ', 'ʠ', '𝔮', '𝕢', '𝓺', '𝖖', '𝓆', '𝚚', '𝑞', '𝘲', '𝙦', 'ℚ', '𝕼', '𝓠', '𝖰', '𝒬', '𝚀', '𝑸', '𝘘', '𝚀'],
    r: [
        'r',
        'R',
        '®',
        'я',
        'ɾ',
        'ř',
        'ŕ',
        'ȑ',
        'ȓ',
        'ṙ',
        'ṛ',
        'ṟ',
        '𝔯',
        '𝕣',
        '𝓻',
        '𝖗',
        '𝓇',
        '𝚛',
        '𝑟',
        '𝘳',
        '𝙧',
        'ℝ',
        'ℜ',
        'ℛ',
        '𝕽',
        '𝓡',
        '𝖱',
        'ℛ',
        '𝚁',
        '𝑹',
        '𝘙',
        '𝚁',
    ],
    s: [
        's',
        'S',
        '5',
        '$',
        '§',
        'ś',
        'š',
        'ş',
        'ѕ',
        'ṡ',
        'ṣ',
        'ș',
        'ʂ',
        'ƨ',
        '𝔰',
        '𝕤',
        '𝓼',
        '𝖘',
        '𝓈',
        '𝚜',
        '𝑠',
        '𝘴',
        '𝙨',
        '𝕊',
        '𝕾',
        '𝓢',
        '𝖲',
        '𝒮',
        '𝚂',
        '𝑺',
        '𝘚',
        '𝚂',
    ],
    t: [
        't',
        'T',
        '7',
        '+',
        '†',
        'τ',
        'т',
        'ţ',
        'ť',
        'ŧ',
        'ṭ',
        'ț',
        'ʇ',
        '𝔱',
        '𝕥',
        '𝓽',
        '𝖙',
        '𝓉',
        '𝚝',
        '𝑡',
        '𝘵',
        '𝙩',
        '𝕋',
        '𝕿',
        '𝓣',
        '𝖳',
        '𝒯',
        '𝚃',
        '𝑻',
        '𝘛',
        '𝚃',
    ],
    u: [
        'u',
        'U',
        'v',
        'ü',
        'ú',
        'ù',
        'û',
        'ū',
        'µ',
        'υ',
        'ц',
        'บ',
        'น',
        'ǔ',
        'ů',
        'ų',
        'ư',
        '𝔲',
        '𝕦',
        '𝓾',
        '𝖚',
        '𝓊',
        '𝚞',
        '𝑢',
        '𝘶',
        '𝙪',
        '𝕌',
        '𝖀',
        '𝓤',
        '𝖴',
        '𝒰',
        '𝚄',
        '𝑼',
        '𝘜',
        '𝚄',
    ],
    v: ['v', 'V', 'υ', 'ν', '\\/', 'ṽ', 'ṿ', 'ѵ', '𝔳', '𝕧', '𝓿', '𝖛', '𝓋', '𝚟', '𝑣', '𝘷', '𝙫', '𝕍', '𝖁', '𝓥', '𝖵', '𝒱', '𝚅', '𝑽', '𝘝', '𝚅'],
    w: [
        'w',
        'W',
        'vv',
        'ѡ',
        'ω',
        'ψ',
        '\\/\\/',
        'Ш',
        'щ',
        'ẁ',
        'ẃ',
        'ẅ',
        'ŵ',
        '𝔴',
        '𝕨',
        '𝔀',
        '𝖜',
        '𝓌',
        '𝚠',
        '𝑤',
        '𝘸',
        '𝙬',
        '𝕎',
        '𝖂',
        '𝓦',
        '𝖶',
        '𝒲',
        '𝚆',
        '𝑾',
        '𝘞',
        '𝚆',
    ],
    x: [
        'x',
        'X',
        '%',
        '*',
        '×',
        'χ',
        'х',
        'ẋ',
        'ẍ',
        '𝔵',
        '𝕩',
        '𝔁',
        '𝖝',
        '𝓍',
        '𝚡',
        '𝑥',
        '𝘹',
        '𝙭',
        '𝕏',
        '𝖃',
        '𝓧',
        '𝖷',
        '𝒳',
        '𝚇',
        '𝑿',
        '𝘟',
        '𝚇',
    ],
    y: [
        'y',
        'Y',
        '¥',
        'γ',
        'у',
        'ý',
        'ÿ',
        'ỳ',
        'ŷ',
        'ȳ',
        'ẏ',
        'ỳ',
        'ƴ',
        '𝔶',
        '𝕪',
        '𝔂',
        '𝖞',
        '𝓎',
        '𝚢',
        '𝑦',
        '𝘺',
        '𝙮',
        '𝕐',
        '𝖄',
        '𝓨',
        '𝖸',
        '𝒴',
        '𝚈',
        '𝒀',
        '𝘠',
        '𝚈',
    ],
    z: [
        'z',
        'Z',
        '2',
        'ʐ',
        'ż',
        'ź',
        'ž',
        'ẓ',
        'ẕ',
        'ƶ',
        '𝔷',
        '𝕫',
        '𝔃',
        '𝖟',
        '𝓏',
        '𝚣',
        '𝑧',
        '𝘻',
        '𝙯',
        'ℤ',
        'ℨ',
        '𝖅',
        '𝓩',
        '𝖹',
        '𝒵',
        '𝚉',
        '𝒁',
        '𝘡',
        '𝚉',
    ],
};

// Kita buat reverse map sekali saja saat bot startup untuk efisiensi.
const reverseLeetMap = new Map();
for (const [baseChar, variations] of Object.entries(leetMap)) {
    for (const variation of variations) {
        // Objek Map lebih cepat untuk lookup daripada object biasa
        reverseLeetMap.set(variation, baseChar);
    }
}

function normalizeText(text) {
    if (!text) return '';

    const lowerText = text.toLowerCase();
    let normalized = '';

    // Iterasi per karakter untuk penggantian yang lebih akurat
    for (let i = 0; i < lowerText.length; i++) {
        const char = lowerText[i];
        // Jika ada di reverse map, ganti dengan huruf aslinya. Jika tidak, biarkan.
        normalized += reverseLeetMap.get(char) || char;
    }

    // Hapus semua karakter yang bukan huruf atau angka setelah dinormalisasi
    return normalized.replace(/[^a-z0-9]/g, '');
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
};

async function checkSpam(message, setting) {
    if (!setting.antiSpamOn) return false;

    const now = Date.now();
    const key = `${message.guild.id}-${message.author.id}`;
    let userData = userCache.get(key) || { fastMessages: [], duplicateMessages: [], violations: 0, isPunished: false, lastPunishment: 0 };
    userData.lastActivity = now;

    // LOGIKA BARU: Reset violations HANYA setelah periode damai yang panjang (24 jam)
    if (userData.violations > 0 && now - userData.lastPunishment > DUPLICATE_TIME_WINDOW) {
        logger.info(`🛡️ Reseting violation for user ${message.author.id}.`);
        userData.violations = 0;
    }

    // Cooldown singkat antar hukuman
    if (userData.isPunished && now - userData.lastPunishment < PUNISHMENT_COOLDOWN) return false;

    // Reset status 'isPunished' setelah cooldown singkat selesai, TAPI JANGAN reset violations
    if (userData.isPunished) {
        userData.isPunished = false;
    }

    // --- Sisa logikanya sama persis ---
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

    if (!spamType && userData.fastMessages.filter((m) => m.content.length > 0 && m.content.length <= 5).length >= 2) {
        spamType = 'short';
        messagesToDelete = [...userData.fastMessages.filter((m) => m.content.length > 0 && m.content.length <= 5)];
    }

    if (spamType) {
        let reasonKey = '';
        if (spamType === 'duplicate') reasonKey = 'core_system_automod_spam_duplicate';
        else if (spamType === 'fast') reasonKey = 'core_system_automod_spam_fast';
        else if (spamType === 'short') reasonKey = 'core_system_automod_spam_short';
        else reasonKey = 'core_system_automod_spam_generic';

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

        // Hukuman sekarang akan meningkat dengan benar!
        const timeoutDuration = Math.min(userData.violations * 180, 1800); // Max 30 menit
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

async function checkBadwords(message, setting) {
    if (!setting.antiBadwordOn) return false;

    // Ambil daftar badword, sama seperti sebelumnya
    const badwords = Array.isArray(setting.badwords)
        ? setting.badwords.map((w) => w.trim().toLowerCase()).filter(Boolean)
        : typeof setting.badwords === 'string' && setting.badwords.trim().length > 0
          ? setting.badwords
                .split(',')
                .map((w) => w.trim().toLowerCase())
                .filter(Boolean)
          : [];

    if (badwords.length === 0) return false;

    // --- BAGIAN YANG DIUBAH ---

    // 1. Helper function untuk "escape" karakter spesial di regex
    //    Ini penting biar kalau ada badword kayak 'c++' atau '$.$ T_T' nggak ngerusak regex.
    const escapeRegex = (str) => str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

    // 2. Kita normalisasi dulu setiap badword, lalu escape.
    const normalizedBadwords = badwords.map((word) => escapeRegex(normalizeText(word)));

    // 3. Buat satu regex besar yang mencari SALAH SATU dari badword itu sebagai KATA UTUH.
    //    `\b` adalah "word boundary". Dia memastikan kata itu dikelilingi spasi, tanda baca, atau awal/akhir kalimat.
    //    Jadi, `\basu\b` akan kena di "dasar asu" tapi TIDAK akan kena di "translate".
    const badwordRegex = new RegExp(`\\b(${normalizedBadwords.join('|')})\\b`, 'i'); // 'i' untuk case-insensitive

    // Gabungkan semua teks dari berbagai sumber, sama seperti sebelumnya
    const contentToCheck = [
        message.content,
        ...message.embeds.flatMap((e) => [e.title, e.description]),
        ...message.attachments.map((a) => a.name),
    ]
        .filter(Boolean)
        .join(' ');

    if (!contentToCheck) return false;

    // Normalisasikan teks yang akan dicek
    const normalizedContent = normalizeText(contentToCheck);

    // 4. Lakukan pengecekan menggunakan regex
    const match = normalizedContent.match(badwordRegex);

    if (match) {
        const foundBadword = match[0]; // Kata yang kena filter
        const reason = await t(message, 'core_helpers_automod_system_automod_badword_detected', { word: foundBadword });

        sendLogsWarning(message, reason, foundBadword, setting);

        if (canDeleteMessage(message)) {
            message.delete().catch(() => {});
        }
        return true; // Ditemukan, hentikan proses
    }

    // --- AKHIR BAGIAN YANG DIUBAH ---

    return false; // Aman
}

async function checkMentions(message, setting) {
    if (!setting.antiMentionOn) return false;

    // MAXIMUM STRICT: even 1 mention is considered spam, and also check for disguised mentions (e.g. <@!id>, <@id>, <@&id>, @everyone, @here, and unicode lookalikes)
    const mentionRegex = /<@!?[0-9]+>|<@&[0-9]+>|@everyone|@here|[\uFF20][eE][vV][eE][rR][yY][oO][nN][eE]|[\uFF20][hH][eE][rR][eE]/g;
    const mentionCount =
        message.mentions.users.size +
        message.mentions.roles.size +
        (message.mentions.everyone ? 1 : 0) +
        (message.mentions.here ? 1 : 0) +
        (message.content.match(mentionRegex) || []).length;

    if (mentionCount >= MENTION_THRESHOLD) {
        const reason = await t(message, 'core_helpers_automod_system_automod_mention_spam');
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

// FUNGSI BARU UNTUK MENGECEK NAMA
async function checkUsername(message, setting) {
    const { author, member, guild } = message;

    // Gunakan cache untuk memastikan kita tidak mengirim log berulang kali untuk user yang sama
    const lastCheckKey = `namecheck-${guild.id}-${author.id}`;
    const lastCheck = userCache.get(lastCheckKey);
    if (lastCheck && Date.now() - lastCheck < 24 * 60 * 60 * 1000) {
        // Cooldown 1 hari
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
        const reason = await t(message, 'core_helpers_automod_system_automod_badname_detected', { word: foundBadword });

        sendLogsWarning(message, reason, `${author.username} | ${member?.displayName}`, setting);

        const userData = userCache.get(lastCheckKey) || {};
        userData.lastCheck = Date.now();
        userCache.set(lastCheckKey, userData);

        return true;
    }

    return false;
}

async function checkLinks(message, setting) {
    // MAXIMUM STRICT: Detect all links, invites, shorteners, obfuscated, and unicode domains
    // Invite regex: allow for leet, homoglyph, zero-width, and separator obfuscation
    // Domain regex: match any TLD, unicode, IDN, and allow for obfuscation
    // Shortener regex: match all known and obfuscated shorteners

    // Helper: Remove all zero-width, whitespace, and common obfuscation chars
    const sanitize = (text) => (text || '').replace(/[\s\\\u200B-\u200D\uFEFF\[\]\(\)\{\}\<\>\|`'"\.,;:!~_=\-]/g, '').toLowerCase();

    // Invite: allow for obfuscation, e.g. d.i.s.c.o.r.d.g.g, d i s c o r d . g g, etc.
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
    // Build a regex that allows for up to 2 non-alphanum between every char
    function obf(s) {
        return s
            .split('')
            .map((c) => `[${c}${c.toUpperCase()}][^a-zA-Z0-9]{0,2}`)
            .join('');
    }
    const inviteRegex = new RegExp(inviteCore.map(obf).join('|') + '[^a-zA-Z0-9]{0,8}[a-z0-9-]{2,}', 'iu');

    // Domain regex: match any domain, including unicode, with optional protocol, www, and path/query
    // Allow for up to 2 non-alphanum between every char in the domain, and allow for IDN
    const domainRegex =
        /(?:(?:https?:\/\/)?(?:www\.)?)?((?:[a-z0-9\u00a1-\uffff][^a-zA-Z0-9]{0,2}){2,}\.(?:[a-z\u00a1-\uffff]{2,}))(?:\/[^\s]*)?/giu;

    // Shortener regex: all known, with obfuscation
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

    // Check in embed, attachment, and username/displayName, all sanitized
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
            // Cek URL attachment, TAPI abaikan jika itu link CDN bawaan Discord
            const isDiscordCdn = url.startsWith('https://cdn.discordapp.com') || url.startsWith('https://media.discordapp.net');

            // Hanya jalankan regex jika BUKAN link CDN Discord
            if (!isDiscordCdn && domainRegex.test(url)) {
                hasLinkInAttachment = true;
                break;
            }
        }
    }

    // let hasInviteInUsername = inviteRegex.test(sanitize(message.author.username)) || inviteRegex.test(sanitize(message.member?.displayName || ""));
    // let hasLinkInUsername = domainRegex.test(message.author.username) || domainRegex.test(message.member?.displayName || "");
    let hasShortener = shortenerRegex.test(sanitizedContent);

    if (
        setting.antiInviteOn &&
        (inviteRegex.test(sanitizedContent) || hasInviteInEmbed || hasInviteInAttachment)
        // || hasInviteInUsername
    ) {
        const reason = await t(message, 'core_helpers_automod_system_automod_invite_detected');
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

    if (
        setting.antiLinkOn &&
        (domainRegex.test(message.content) ||
            hasLinkInEmbed ||
            hasLinkInAttachment ||
            // hasLinkInUsername ||
            hasShortener)
    ) {
        const reason = await t(message, 'core_helpers_automod_system_automod_link_detected');
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
        // Cek timestamp `lastActivity` atau `lastCheck`
        const lastActive = value.lastActivity || value.lastCheck;
        if (lastActive && now - lastActive > CACHE_EXPIRATION_TIME) {
            userCache.delete(key);
        }
    }
    logger.info(`🧹 [CACHE CLEANUP] User cache cleaned. Current size: ${userCache.size}`);
}

// Jalankan pembersihan setiap satu jam
setInterval(cleanupCaches, 60 * 60 * 1000);

module.exports = {
    automodSystem,
    userCache,
};
