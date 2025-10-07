/**
 * @file src/utils/formatter.js
 * @description Text formatting helpers for stylized alphabets used in Discord messages.
 * Provides utilities to convert plain Latin characters into tiny and tiny-bold variants.
 * Note: Non-Latin characters are left unchanged.
 *
 * @copyright © 2025 kenndeclouv
 * @version 0.9.9-beta-rc1
 */

/**
 * Converts a string to a small-caps-like Unicode alphabet variant.
 * @param {string} text - Input text.
 * @returns {string} Converted text using tiny letters.
 */
function toTinyText(text) {
    const normal = 'abcdefghijklmnopqrstuvwxyz';
    const tiny = [
        'ᴀ',
        'ʙ',
        'ᴄ',
        'ᴅ',
        'ᴇ',
        'ғ',
        'ɢ',
        'ʜ',
        'ɪ',
        'ᴊ',
        'ᴋ',
        'ʟ',
        'ᴍ',
        'ɴ',
        'ᴏ',
        'ᴘ',
        'ǫ',
        'ʀ',
        's',
        'ᴛ',
        'ᴜ',
        'ᴠ',
        'ᴡ',
        'x',
        'ʏ',
        'ᴢ',
    ];

    return text
        .split('')
        .map((char) => {
            const lowerChar = char.toLowerCase();
            const index = normal.indexOf(lowerChar);
            if (index !== -1) {
                return tiny[index];
            }
            return char;
        })
        .join('');
}

/**
 * Converts a string to a bold Unicode alphabet variant approximating "tiny" bold.
 * @param {string} text - Input text.
 * @returns {string} Converted text using bold tiny letters.
 */
function toTinyBoldText(text) {
    const normal = 'abcdefghijklmnopqrstuvwxyz';
    const tinyBold = [
        '𝗮',
        '𝗯',
        '𝗰',
        '𝗱',
        '𝗲',
        '𝗳',
        '𝗴',
        '𝗵',
        '𝗶',
        '𝗷',
        '𝗸',
        '𝗹',
        '𝗺',
        '𝗻',
        '𝗼',
        '𝗽',
        '𝗾',
        '𝗿',
        '𝘀',
        '𝘁',
        '𝘂',
        '𝘃',
        '𝘄',
        '𝘅',
        '𝘆',
        '𝘇',
    ];

    return text
        .split('')
        .map((char) => {
            const lowerChar = char.toLowerCase();
            const index = normal.indexOf(lowerChar);
            if (index !== -1) {
                return tinyBold[index];
            }
            return char;
        })
        .join('');
}

export { toTinyText, toTinyBoldText };
