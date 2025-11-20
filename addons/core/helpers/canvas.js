/**
 * @namespace: addons/core/helpers/canvas.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { createCanvas, loadImage, registerFont } = require('canvas');
const { t } = require('@coreHelpers/translator');
const axios = require('axios');
const path = require('path');
const os = require('os');
const fs = require('fs').promises;
const logger = require('@coreHelpers/logger');

async function _loadImageHelper(source) {
    if (!source) return null;
    try {
        if (source.startsWith('http')) {
            const response = await axios.get(source, { responseType: 'arraybuffer' });
            return await loadImage(Buffer.from(response.data, 'binary'));
        }
        return await loadImage(source);
    } catch (err) {
        logger.error(`Failed to load image from source: ${source}`, err);
        return null;
    }
}

// --- 💎 PERPUSTAKAAN LAYOUT BAWAAN ---
const EXTRADRAW = {
    /**
     * Layout standar dengan avatar di tengah, teks di atas & bawah.
     */
    classicCentered: async (ctx, canvas, config, data) => {
        // Gambar avatar
        const avatarImg = await _loadImageHelper(data.avatarURL);
        if (avatarImg) {
            const centerX = config.width / 2;
            const centerY = config.height / 2;
            const radius = config.avatar.size / 2;
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY + config.avatar.yOffset, radius, 0, Math.PI * 2, true);
            ctx.clip();
            ctx.drawImage(avatarImg, centerX - radius, centerY - radius + config.avatar.yOffset, config.avatar.size, config.avatar.size);
            ctx.restore();
        }

        // Gambar teks
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (config.mainText?.content) {
            ctx.font = config.mainText.font;
            ctx.fillStyle = config.mainText.color;
            ctx.shadowColor = config.mainText.shadow?.color || 'transparent';
            ctx.shadowBlur = config.mainText.shadow?.blur || 0;
            ctx.fillText(_replacePlaceholders(config.mainText.content, data), centerX, centerY + config.mainText.yOffset);
        }
        if (config.subText?.content) {
            ctx.font = config.subText.font;
            ctx.fillStyle = config.subText.color;
            ctx.shadowColor = config.subText.shadow?.color || 'transparent';
            ctx.shadowBlur = config.subText.shadow?.blur || 0;
            ctx.fillText(_replacePlaceholders(config.subText.content, data), centerX, centerY + config.subText.yOffset);
        }
    },
    /**
     * Layout kustom Kythia dengan teks vertikal.
     */
    kythiaVertical: async (ctx, canvas, config, data) => {
        // Only try to load foreground if data.foregroundURL is defined
        let fgImage = null;
        if (data && typeof data.foregroundURL === 'string' && data.foregroundURL.length > 0) {
            fgImage = await _loadImageHelper(data.foregroundURL);
        }

        // Teks Vertikal
        ctx.save();
        ctx.font = `110px "${(data && data.fontFamily) || 'BagelFatOne-Regular'}"`;
        ctx.fillStyle = '#F791A8';
        ctx.translate(config.width - 210, 80);
        ctx.rotate(Math.PI / 2);
        ctx.fillText(((data && data.username) || '').toUpperCase().slice(0, 11), 0, 0);
        ctx.restore();

        // Member Count
        if (data && data.memberCount) {
            ctx.save();
            ctx.font = `32px "${data.fontFamily || 'BagelFatOne-Regular'}"`;
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            ctx.fillText(`#${data.memberCount}`, config.width - 15, config.height - 15);
            ctx.restore();
        }

        // Foreground ditumpuk paling atas
        if (fgImage) {
            ctx.drawImage(fgImage, 0, 0, config.width, config.height);
        }
    },
};

/**
 * Helper untuk membuat avatar menjadi lingkaran.
 * @param {CanvasRenderingContext2D} ctx - Konteks canvas.
 * @param {number} x - Koordinat X.
 * @param {number} y - Koordinat Y.
 * @param {number} size - Ukuran diameter.
 */
function clipToCircle(ctx, x, y, size) {
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
}

/**
 * Helper untuk memotong teks jika terlalu panjang.
 * @param {CanvasRenderingContext2D} ctx - Konteks canvas.
 * @param {string} text - Teks yang akan ditampilkan.
 * @param {number} maxWidth - Lebar maksimal dalam pixel.
 * @returns {string} Teks yang sudah dipotong jika perlu.
 */
function fitText(ctx, text, maxWidth) {
    let currentText = text;
    if (ctx.measureText(currentText).width > maxWidth) {
        while (ctx.measureText(currentText + '...').width > maxWidth && currentText.length > 0) {
            currentText = currentText.slice(0, -1);
        }
        return currentText.trim() + '...';
    }
    return currentText;
}

/**
 * Helper untuk menggambar rounded rectangle.
 */
function drawRoundedRect(ctx, x, y, width, height, radius, fillStyle) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.restore();
}

/**
 * Helper canggih untuk mendaftarkan font dari URL.
 * Hanya akan men-download jika font belum ada di cache lokal.
 * @param {string} url - URL ke file font (.ttf, .otf, .woff, dll).
 * @param {string} fontFamily - Nama family yang akan didaftarkan.
 */
async function registerFontFromUrl(url, fontFamily) {
    const fontFileName = path.basename(new URL(url).pathname);
    const tempFontPath = path.join(os.tmpdir(), fontFileName);

    try {
        // Cek dulu, apakah font sudah pernah kita download?
        await fs.access(tempFontPath);
        logger.info(`🔠 Font "${fontFileName}" found in local cache. Skipping download.`);
    } catch (error) {
        // Jika belum ada, download font-nya
        try {
            logger.info(`🔠 Downloading font from ${url}...`);
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            await fs.writeFile(tempFontPath, response.data);
            logger.info(`🔠 Font saved to temporary path: ${tempFontPath}`);
        } catch (downloadError) {
            logger.error(`🔠 Failed to download or save font from ${url}`, downloadError);
            return; // Gagal, jangan lanjutkan
        }
    }

    // Daftarkan font dari path sementara yang sudah kita siapkan
    try {
        registerFont(tempFontPath, { family: fontFamily });
    } catch (registerError) {
        // Kemungkinan font sudah terdaftar di sesi ini, abaikan
    }
}

/**
 * Fungsi utama serbaguna untuk membuat banner welcome/leave dengan konfigurasi sangat fleksibel.
 *
 * Semua konfigurasi bisa dikirim dari parameter options, termasuk:
 * - width, height, backgroundURL, foregroundURL, fallbackBgColor
 * - fontPath, fontFamily
 * - avatar: { enabled, url, size, x, y, round, yOffset, border }
 * - texts: array konfigurasi teks (bebas, multi layer)
 * - overlay, border, extraDraw
 *
 * @param {Object} options
 * @returns {Promise<Buffer>}
 */
async function generateBanner(options = {}) {
    // Default config, semua properti bisa di override dari options
    const defaultConfig = {
        width: 1024,
        height: 512,
        backgroundURL: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809',
        foregroundURL: undefined,
        // fontPath: "./fonts/Poppins-Bold.ttf",
        fontFamily: 'Poppins-Bold',
        fallbackBgColor: '#23272A',
        avatar: {
            enabled: !!options.avatarURL,
            url: options.avatarURL,
            size: 128,
            x: null,
            y: null,
            round: true,
            yOffset: 0,
            border: null, // { color, width }
        },
        texts: [
            {
                text: options.welcomeText || null,
                font: options.font || 'bold 42px "Poppins-Bold"',
                color: options.color || '#FFFFFF',
                align: options.align || 'center',
                baseline: options.baseline || 'middle',
                x: null, // auto center
                y: null, // auto
                shadow: { color: options.shadow?.color || 'rgba(0,0,0,0.4)', blur: options.shadow?.blur || 6 },
                maxWidth: null,
                uppercase: true,
            },
            {
                text: options.username,
                font: options.font || 'bold 32px "Poppins-Bold"',
                color: options.color || '#FFFFFF',
                align: options.align || 'center',
                baseline: options.baseline || 'middle',
                x: null,
                y: null,
                shadow: { color: options.shadow?.color || 'rgba(0,0,0,0.4)', blur: options.shadow?.blur || 6 },
                maxWidth: null,
                uppercase: false,
                // translateKey: null
            },
        ],
        overlay: { color: 'rgba(0,0,0,0.4)' },
        border: { color: kythia.bot.color, width: 6 },
        extraDraw: options.extraDraw || 'classicCentered',
    };

    // Merge config, deep merge untuk avatar, texts, overlay, border, extraDraw
    const config = {
        ...defaultConfig,
        ...options,
        avatar: { ...defaultConfig.avatar, ...(options.avatar || {}) },
        overlay: options.overlay !== undefined ? options.overlay : defaultConfig.overlay,
        border: options.border !== undefined ? options.border : defaultConfig.border,
        // texts: jika options.texts ada, pakai itu, jika tidak, pakai default, tapi pastikan x/y diisi otomatis
        texts: Array.isArray(options.texts)
            ? options.texts
            : defaultConfig.texts.map((t, i) => ({
                  ...t,
                  x: t.x !== null && t.x !== undefined ? t.x : (options.width || defaultConfig.width) / 2,
                  y:
                      t.y !== null && t.y !== undefined
                          ? t.y
                          : i === 0
                            ? (options.height || defaultConfig.height) / 2 - 80
                            : (options.height || defaultConfig.height) / 2 + 100,
                  maxWidth:
                      t.maxWidth !== null && t.maxWidth !== undefined
                          ? t.maxWidth
                          : i === 0
                            ? (options.width || defaultConfig.width) * 0.9
                            : (options.width || defaultConfig.width) * 0.8,
              })),
        extraDraw: EXTRADRAW[options.extraDraw || 'classicCentered'],
    };

    // Daftarkan font jika ada
    // if (config.fontURL && config.fontFamily) {
    //     // Jika ada URL, gunakan helper canggih kita
    //     await registerFontFromUrl(config.fontURL, config.fontFamily);
    // } else if (config.fontPath && config.fontFamily) {
    //     // Jika path lokal, gunakan cara lama
    //     try { registerFont(config.fontPath, { family: config.fontFamily }); } catch (e) { }
    // }

    // Siapkan canvas
    const canvas = createCanvas(config.width, config.height);
    const ctx = canvas.getContext('2d');

    // 1. Gambar background
    try {
        let bgImage;
        if (config.backgroundURL && config.backgroundURL.startsWith('http')) {
            const response = await axios.get(config.backgroundURL, { responseType: 'arraybuffer' });
            bgImage = await loadImage(Buffer.from(response.data, 'binary'));
        } else if (config.backgroundURL) {
            bgImage = await loadImage(config.backgroundURL);
        }
        if (bgImage) {
            ctx.drawImage(bgImage, 0, 0, config.width, config.height);
        } else {
            throw new Error('No background image');
        }
    } catch (e) {
        ctx.fillStyle = config.fallbackBgColor;
        ctx.fillRect(0, 0, config.width, config.height);
    }

    // 2. Overlay (optional)
    if (config.overlay && config.overlay.color) {
        ctx.save();
        ctx.fillStyle = config.overlay.color;
        ctx.fillRect(0, 0, config.width, config.height);
        ctx.restore();
    }

    // 3. Avatar (optional)
    if (config.avatar && config.avatar.enabled && config.avatar.url) {
        try {
            const avatarImg = await loadImage(config.avatar.url);
            const size = config.avatar.size;
            const x = config.avatar.x !== null && config.avatar.x !== undefined ? config.avatar.x : config.width / 2 - size / 2;
            const y =
                config.avatar.y !== null && config.avatar.y !== undefined
                    ? config.avatar.y
                    : config.height / 2 - size / 2 + (config.avatar.yOffset || 0);
            ctx.save();
            if (config.avatar.round) {
                ctx.beginPath();
                ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.clip();
            }
            ctx.drawImage(avatarImg, x, y, size, size);
            ctx.restore();

            // Avatar border
            if (config.avatar.border && config.avatar.border.width > 0) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(x + size / 2, y + size / 2, size / 2 + config.avatar.border.width / 2, 0, Math.PI * 2, true);
                ctx.strokeStyle = config.avatar.border.color || '#fff';
                ctx.lineWidth = config.avatar.border.width;
                ctx.stroke();
                ctx.restore();
            }
        } catch (e) {
            // Gagal load avatar, abaikan
        }
    }

    // 5. Teks (multi layer, sangat fleksibel)
    for (const textCfg of config.texts) {
        let text = textCfg.text;
        // Translate jika perlu
        // if (!text && textCfg.translateKey && options.interaction) {
        //     text = await t(options.interaction, textCfg.translateKey, textCfg.translateVars || {});
        // }
        if (!text) continue;
        if (textCfg.uppercase) text = text.toUpperCase();

        ctx.save();
        ctx.font = textCfg.font || '32px "Poppins-Bold"';
        ctx.fillStyle = textCfg.color || '#fff';
        ctx.textAlign = textCfg.align || 'left';
        ctx.textBaseline = textCfg.baseline || 'alphabetic';
        if (textCfg.shadow) {
            ctx.shadowColor = textCfg.shadow.color || 'rgba(0,0,0,0.4)';
            ctx.shadowBlur = textCfg.shadow.blur || 6;
        }
        let x = typeof textCfg.x === 'number' ? textCfg.x : config.width / 2;
        let y = typeof textCfg.y === 'number' ? textCfg.y : config.height / 2;
        let drawText = text;
        if (textCfg.maxWidth) {
            drawText = fitText(ctx, text, textCfg.maxWidth);
        }
        ctx.fillText(drawText, x, y);
        ctx.restore();
    }

    // 6. Border (optional)
    if (config.border && config.border.width > 0) {
        ctx.save();
        ctx.strokeStyle = config.border.color || '#3498DB';
        ctx.lineWidth = config.border.width;
        ctx.strokeRect(0, 0, config.width, config.height);
        ctx.restore();
    }

    // 7. Extra custom draw (optional)
    if (typeof config.extraDraw === 'function') {
        // Pass a safe data object to extraDraw to avoid undefined property errors
        // Use options as data, but always provide empty object fallback
        await config.extraDraw(ctx, canvas, config, options || {});
    }

    // 4. Foreground (optional, di atas avatar & teks)
    if (config.foregroundURL) {
        try {
            let fgImage;
            if (config.foregroundURL.startsWith('http')) {
                const response = await axios.get(config.foregroundURL, { responseType: 'arraybuffer' });
                fgImage = await loadImage(Buffer.from(response.data, 'binary'));
            } else {
                fgImage = await loadImage(config.foregroundURL);
            }
            ctx.drawImage(fgImage, 0, 0, config.width, config.height);
        } catch (e) {
            // Gagal load foreground, abaikan
        }
    }

    return canvas.toBuffer('image/png');
}

module.exports = {
    generateBanner,
    // Helper exports (optional)
    fitText,
    drawRoundedRect,
    clipToCircle,
};
