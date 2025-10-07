/**
 * @file src/utils/color.js
 * @description Color conversion utilities for hex, RGB, decimal, and Discord color names.
 *
 * Example usage:
 * convertColor(input, { from: 'hex', to: 'rgb' })       // -> { r, g, b }
 * convertColor(input, { from: 'rgb', to: 'hex' })       // -> '#RRGGBB'
 * convertColor(input, { from: 'hex', to: 'decimal' })   // -> 0xRRGGBB (number)
 * convertColor(input, { from: 'decimal', to: 'hex' })   // -> '#RRGGBB'
 * convertColor(input, { from: 'rgb', to: 'decimal' })   // -> 0xRRGGBB
 * convertColor(input, { from: 'decimal', to: 'rgb' })   // -> { r, g, b }
 * convertColor('Blurple', { from: 'discord', to: 'hex' }) // -> '#5865F2'
 * convertColor('Red', { from: 'discord', to: 'rgb' })   // -> { r: 237, g: 66, b: 69 }
 *
 * @copyright © 2025 kenndeclouv
 * @version 0.9.9-beta-rc1
 */
const discordColors = {
    Default: 0x000000,
    White: 0xffffff,
    Aqua: 0x1abc9c,
    Green: 0x57f287,
    Blue: 0x3498db,
    Yellow: 0xfee75c,
    Purple: 0x9b59b6,
    LuminousVividPink: 0xe91e63,
    Fuchsia: 0xeb459e,
    Gold: 0xf1c40f,
    Orange: 0xe67e22,
    Red: 0xed4245,
    Grey: 0x95a5a6,
    Navy: 0x34495e,
    DarkAqua: 0x11806a,
    DarkGreen: 0x1f8b4c,
    DarkBlue: 0x206694,
    DarkPurple: 0x71368a,
    DarkVividPink: 0xad1457,
    DarkGold: 0xc27c0e,
    DarkOrange: 0xa84300,
    DarkRed: 0x992d22,
    DarkGrey: 0x979c9f,
    DarkerGrey: 0x7f8c8d,
    LightGrey: 0xbcc0c0,
    DarkNavy: 0x2c3e50,
    Blurple: 0x5865f2,
    Greyple: 0x99aab5,
    DarkButNotBlack: 0x2c2f33,
    NotQuiteBlack: 0x23272a,
};

/**
 * Converts a color between multiple representations.
 *
 * @param {string|number|{r:number,g:number,b:number}} input - The input color value.
 * @param {{from:'hex'|'rgb'|'decimal'|'discord', to:'hex'|'rgb'|'decimal'}} options - Conversion options.
 * @returns {string|number|{r:number,g:number,b:number}} The converted color.
 */
function convertColor(input, { from, to }) {
    // Helper: hex to rgb
    function hexToRgb(hex) {
        let h = hex.replace(/^#/, '');
        if (h.length === 3) {
            h = h
                .split('')
                .map((x) => x + x)
                .join('');
        }
        if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error('Invalid hex color');
        return {
            r: parseInt(h.slice(0, 2), 16),
            g: parseInt(h.slice(2, 4), 16),
            b: parseInt(h.slice(4, 6), 16),
        };
    }

    // Helper: rgb to hex
    function rgbToHex({ r, g, b }) {
        if (
            typeof r !== 'number' ||
            typeof g !== 'number' ||
            typeof b !== 'number' ||
            r < 0 ||
            r > 255 ||
            g < 0 ||
            g > 255 ||
            b < 0 ||
            b > 255
        )
            throw new Error('Invalid RGB color');
        return (
            '#' +
            [r, g, b]
                .map((x) => {
                    const hex = x.toString(16);
                    return hex.length === 1 ? '0' + hex : hex;
                })
                .join('')
                .toUpperCase()
        );
    }

    // Helper: hex to decimal (returns 0xRRGGBB)
    function hexToDecimal(hex) {
        let h = hex.replace(/^#/, '');
        if (h.length === 3) {
            h = h
                .split('')
                .map((x) => x + x)
                .join('');
        }
        if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error('Invalid hex color');
        return Number('0x' + h.toUpperCase());
    }

    // Helper: decimal to hex
    function decimalToHex(decimal) {
        if (typeof decimal !== 'number' || decimal < 0 || decimal > 0xffffff) throw new Error('Invalid decimal color');
        let hex = decimal.toString(16).toUpperCase();
        while (hex.length < 6) hex = '0' + hex;
        return '#' + hex;
    }

    // Helper: rgb to decimal (returns 0xRRGGBB)
    function rgbToDecimal({ r, g, b }) {
        if (
            typeof r !== 'number' ||
            typeof g !== 'number' ||
            typeof b !== 'number' ||
            r < 0 ||
            r > 255 ||
            g < 0 ||
            g > 255 ||
            b < 0 ||
            b > 255
        )
            throw new Error('Invalid RGB color');
        return (r << 16) + (g << 8) + b;
    }

    // Helper: decimal to rgb
    function decimalToRgb(decimal) {
        if (typeof decimal !== 'number' || decimal < 0 || decimal > 0xffffff) throw new Error('Invalid decimal color');
        return {
            r: (decimal >> 16) & 0xff,
            g: (decimal >> 8) & 0xff,
            b: decimal & 0xff,
        };
    }

    // Main conversion logic
    if (from === to) return input;

    let rgb, hex, decimal;

    switch (from) {
        case 'hex':
            hex = input;
            rgb = hexToRgb(hex);
            decimal = hexToDecimal(hex);
            break;
        case 'rgb':
            rgb = input;
            hex = rgbToHex(rgb);
            decimal = rgbToDecimal(rgb);
            break;
        case 'decimal':
            decimal = input;
            hex = decimalToHex(decimal);
            rgb = decimalToRgb(decimal);
            break;
        case 'discord':
            if (typeof input === 'string') {
                // Case-insensitive key matching for flexibility
                const key = Object.keys(discordColors).find((k) => k.toLowerCase() === input.toLowerCase());
                if (!key) throw new Error(`Invalid Discord color name: ${input}`);
                decimal = discordColors[key];
            } else if (typeof input === 'number') {
                // If already a number (decimal), use directly
                decimal = input;
            } else {
                throw new Error('Invalid input type for Discord color');
            }
            hex = decimalToHex(decimal);
            rgb = decimalToRgb(decimal);
            break;
        default:
            throw new Error(`Invalid "from" color type: ${from}`);
    }

    switch (to) {
        case 'hex':
            return hex;
        case 'rgb':
            return rgb;
        case 'decimal':
            return decimal;
        default:
            throw new Error(`Invalid "to" color type: ${to}`);
    }
}

module.exports = convertColor;
