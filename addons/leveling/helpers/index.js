/**
 * @namespace: addons/leveling/helpers/index.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */

const { createCanvas, loadImage, registerFont } = require('canvas');
const ServerSetting = require('@coreModels/ServerSetting');
const User = require('@coreModels/User');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const { t } = require('@utils/translator');
const { embedFooter } = require('@src/utils/discord');

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

// rumus xp yg dibutuhin buat naik level
const levelUpXp = (level) => level * level * 50;
// fungsi buat nambah xp
const addXp = async (guildId, userId, xpToAdd, message, channel) => {
    if (!channel) {
        // coba fetch ulang setting
        const setting = await ServerSetting.getCache({ guildId: message.guild.id });
        if (setting && setting.levelingChannelId) {
            channel = message.guild.channels.cache.get(setting.levelingChannelId) || null;
        }
    }
    let user = await User.getCache({ userId: userId, guildId: guildId });

    if (!user) {
        user = await User.create({ guildId, userId, xp: 0, level: 1 });
    }

    user.xp += xpToAdd;
    let leveledUp = false;
    const levelBefore = user.level;

    // cek terus sampai xp ga cukup buat naik level
    while (user.xp >= levelUpXp(user.level)) {
        user.xp -= levelUpXp(user.level);
        user.level += 1;
        leveledUp = true;
    }

    // update user di database
    await user.update({ xp: user.xp, level: user.level });
    await user.saveAndUpdateCache();
    // kalo ga naik level, udahan
    if (!leveledUp) return;

    const member = message.guild.members.cache.get(userId);
    const serverSetting = await ServerSetting.getCache({ guildId: message.guild.id });

    // Cek role reward, ambil reward yang dilewati
    let rewardEmbed = null;
    let rewardRoleName = null;
    let rewardLevel = null;
    if (serverSetting && Array.isArray(serverSetting.roleRewards)) {
        const rewards = serverSetting.roleRewards.filter((r) => r.level > levelBefore && r.level <= user.level);
        // Ambil reward tertinggi saja (kalau ada)
        if (rewards.length > 0) {
            const highestReward = rewards.reduce((a, b) => (a.level > b.level ? a : b));
            const role = message.guild.roles.cache.get(highestReward.role);
            if (role && member) {
                await member.roles.add(role).catch(() => {});
                rewardRoleName = role.name;
                rewardLevel = highestReward.level;
            }
        }
    }

    let buffer;
    try {
        buffer = await generateLevelImage({
            username: message.author.username,
            avatarURL: message.author.displayAvatarURL({ extension: 'png', size: 256 }),
            level: user.level,
            xp: user.xp,
            nextLevelXp: levelUpXp(user.level),
            backgroundURL: 'https://files.catbox.moe/3pujs4.png',
        });
    } catch (err) {
        buffer = null;
    }

    let description =
        `${await t(message, 'leveling_helpers_index_leveling_profile_up_title')}\n` +
        (await t(message, 'leveling_helpers_index_leveling_profile_up_desc', {
            username: message.author.username,
            mention: message.author.toString(),
            level: user.level || 0,
            xp: user.xp || 0,
            nextLevelXp: levelUpXp(user.level),
        }));

    if (rewardRoleName && rewardLevel) {
        description +=
            `\n\n${await t(message, 'leveling_helpers_index_leveling_role_reward_title')}\n` +
            (await t(message, 'leveling_helpers_index_leveling_role_reward_desc', {
                mention: message.author.toString(),
                role: rewardRoleName,
                level: rewardLevel,
            }));
    }

    const levelEmbed = new EmbedBuilder()
        .setColor(kythia.bot.color)
        .setDescription(description)
        .setThumbnail(message.author.displayAvatarURL())
        .setFooter(await embedFooter(message));

    // logika pengiriman:
    if (channel) {
        // jika buffer valid (Buffer atau string), kirim embed + file gambar
        if (buffer && (Buffer.isBuffer(buffer) || typeof buffer === 'string')) {
            try {
                levelEmbed.setImage('attachment://level-profile.png');
            } catch (e) {
                // skip setImage jika error
            }
            await channel
                .send({
                    embeds: [levelEmbed],
                    files: [{ attachment: buffer, name: 'level-profile.png' }],
                })
                .catch(() => {});
        } else {
            // jika buffer gagal/null, kirim embed saja tanpa gambar
            await channel
                .send({
                    embeds: [levelEmbed],
                })
                .catch(() => {});
        }
    }
};

// fungsi buat hitung level dari xp total
const calculateLevel = (xp) => {
    let level = 1;
    while (xp >= levelUpXp(level)) {
        xp -= levelUpXp(level);
        level += 1;
    }
    return level;
};

function calculateLevelAndXp(totalXp) {
    let level = 1;
    let xp = totalXp;
    while (xp >= levelUpXp(level)) {
        xp -= levelUpXp(level);
        level += 1;
    }
    return { newLevel: level, newXp: xp };
}
// optional: font custom
// registerFont(path.join(__dirname, 'fonts', 'Poppins-Bold.ttf'), { family: 'Poppins' });

/**
 * generateLevelImage
 *
 * Fungsi ini membuat gambar profil level user dengan berbagai elemen visual.
 * Semua angka/posisi di-comment penjelasannya, termasuk efek jika diubah (naik/turun, kanan/kiri).
 */
async function generateLevelImage({ username, avatarURL, level, xp, nextLevelXp, backgroundURL }) {
    // Ukuran asli gambar: width = 800px (lebar), height = 250px (tinggi)
    // Kalau width diperbesar, semua konten akan lebih melebar ke kanan.
    // Kalau height diperbesar, semua konten akan lebih turun ke bawah.
    const width = 800;
    const height = 250;

    // borderWidth = 5px, ini ketebalan bingkai luar (frame) di sekeliling gambar.
    // Kalau dinaikkan, frame makin tebal ke dalam (menyempitkan area konten).
    const borderWidth = 5;

    // borderRadius = 25px, ini radius sudut membulat pada frame.
    // Kalau dinaikkan, sudut makin bulat. Kalau diturunkan, makin kotak.
    const borderRadius = 25;

    // Membuat canvas dengan ukuran di atas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // --- Proses Menggambar ---

    // 1. Frame luar (bingkai)
    // Menggambar kotak besar dengan sudut membulat sebagai border.
    ctx.fillStyle = kythia.bot.color; // Warna border diambil dari config bot.
    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, borderRadius); // Mulai dari pojok kiri atas (0,0)
    ctx.fill();
    ctx.save();

    // 2. Area konten (lubang di tengah)
    // Membuat area dalam (konten) dengan clipping, supaya background hanya di area ini.
    ctx.beginPath();
    ctx.roundRect(
        borderWidth, // X: Jarak dari kiri, makin besar makin ke kanan (konten makin sempit)
        borderWidth, // Y: Jarak dari atas, makin besar makin ke bawah (konten makin sempit)
        width - borderWidth * 2, // Lebar area konten, makin kecil kalau borderWidth naik
        height - borderWidth * 2, // Tinggi area konten, makin kecil kalau borderWidth naik
        borderRadius - 5 // Sudut membulat, sedikit lebih kecil dari border luar supaya pas
    );
    ctx.clip();

    // 3. Background utama
    try {
        if (backgroundURL) {
            let bgImage;
            if (backgroundURL.startsWith('http')) {
                // Ambil gambar dari URL
                const response = await axios.get(backgroundURL, { responseType: 'arraybuffer' });
                const buffer = Buffer.from(response.data, 'binary');
                bgImage = await loadImage(buffer);
            } else {
                // Ambil gambar dari file lokal
                bgImage = await loadImage(path.resolve(backgroundURL));
            }
            // Gambar background memenuhi seluruh area konten
            ctx.drawImage(bgImage, 0, 0, width, height);
        } else {
            // Kalau tidak ada gambar, pakai gradient gelap
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, '#23272a');
            gradient.addColorStop(1, '#2c2f33');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }
    } catch (bgError) {
        // Kalau gagal load background, fallback ke warna gelap
        console.error('Error loading background:', bgError);
        ctx.fillStyle = '#23272a';
        ctx.fillRect(0, 0, width, height);
    }

    // 4. Avatar user
    let avatar;
    try {
        // Pastikan format avatar PNG
        const processedAvatarURL = avatarURL.replace(/\.webp\b/i, '.png');
        avatar = await loadImage(processedAvatarURL);
    } catch (avatarError) {
        console.error('Error loading avatar:', avatarError);
        // Bisa tambahkan placeholder avatar di sini kalau mau
    }

    if (avatar) {
        // avatarSize: ukuran avatar (kotak), dihitung dari tinggi canvas dikurangi border dan margin
        // Rumus: height - (borderWidth * 2) - 80
        // Kalau height dinaikkan, avatar makin besar. Kalau 80 dinaikkan, avatar makin kecil.
        const avatarSize = height - borderWidth * 2 - 80;

        // avatarX: posisi X avatar dari kiri, borderWidth + 40
        // Kalau 40 dinaikkan, avatar makin ke kanan. Diturunkan, makin ke kiri.
        const avatarX = borderWidth + 40;

        // avatarY: posisi Y avatar dari atas, borderWidth + 40
        // Kalau 40 dinaikkan, avatar makin ke bawah. Diturunkan, makin ke atas.
        const avatarY = borderWidth + 40;

        // Gambar avatar dalam lingkaran
        ctx.save();
        ctx.beginPath();
        ctx.arc(
            avatarX + avatarSize / 2, // Tengah lingkaran X
            avatarY + avatarSize / 2, // Tengah lingkaran Y
            avatarSize / 2, // Radius lingkaran
            0,
            Math.PI * 2,
            true
        );
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        // Border lingkaran avatar (5px)
        ctx.save();
        ctx.beginPath();
        ctx.arc(
            avatarX + avatarSize / 2,
            avatarY + avatarSize / 2,
            avatarSize / 2 + 2.5, // Radius lebih besar 2.5px dari avatar, supaya border di luar
            0,
            Math.PI * 2,
            true
        );
        ctx.lineWidth = 5;
        ctx.strokeStyle = kythia.bot.color;
        ctx.stroke();
        ctx.restore();
    }

    ctx.restore(); // Hapus clipping area konten

    // contentX: posisi X awal untuk teks (username, level, progress bar)
    // Nilai 250 artinya semua teks mulai dari 250px dari kiri.
    // Kalau dinaikkan, teks makin ke kanan. Diturunkan, makin ke kiri (bisa nabrak avatar).
    const contentX = 250;

    // 5. Teks Username
    // Posisi Y = 95, artinya 95px dari atas. Dinaikkan: teks makin ke bawah. Diturunkan: makin ke atas.
    ctx.font = 'bold 40px "Poppins-Medium", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(username, contentX, 90);

    // 6. Teks Level
    // Posisi Y = 135, artinya 135px dari atas. Kalau dinaikkan, teks level makin ke bawah.
    ctx.font = '28px "Poppins-Bold", sans-serif';
    ctx.fillStyle = kythia.bot.color;
    ctx.fillText(`Level ${level}`, contentX, 130);

    // 7. Progress Bar (XP)
    // progressWidth: lebar progress bar, dihitung dari sisa lebar canvas setelah contentX dan margin kanan 40px
    // Kalau progressWidth dinaikkan, bar makin panjang ke kanan.
    const progressWidth = width - contentX - 40;
    // progressHeight: tinggi progress bar, default 30px. Dinaikkan: bar makin tebal ke bawah.
    const progressHeight = 30;
    // progressX: posisi X bar, sama dengan contentX (mulai dari kiri teks)
    const progressX = contentX;
    // progressY: posisi Y bar, 180px dari atas. Dinaikkan: bar makin ke bawah.
    const progressY = 180;
    // barRadius: radius sudut progress bar, setengah dari tinggi bar supaya bulat penuh.
    const barRadius = progressHeight / 2;

    // Background bar (warna abu-abu gelap)
    ctx.fillStyle = '#444';
    ctx.beginPath();
    ctx.roundRect(progressX, progressY, progressWidth, progressHeight, barRadius);
    ctx.fill();

    // Progress fill (XP user)
    // percent: persentase XP user ke level berikutnya (0-1)
    const percent = Math.min(Math.max(xp / nextLevelXp, 0), 1);
    if (percent > 0) {
        ctx.save();
        // Clipping supaya progress fill tetap rounded
        ctx.beginPath();
        ctx.roundRect(progressX, progressY, progressWidth, progressHeight, barRadius);
        ctx.clip();

        // Gambar progress (warna bot)
        // Lebar progress = progressWidth * percent, jadi makin banyak XP, makin panjang ke kanan.
        ctx.fillStyle = kythia.bot.color;
        ctx.fillRect(progressX, progressY, progressWidth * percent, progressHeight);

        ctx.restore();
    }

    // 8. Teks XP di atas progress bar
    // Posisi X: di tengah progress bar (progressX + (progressWidth - textWidth) / 2)
    // Posisi Y: progressY + progressHeight / 2 + 7 (tengah bar, lalu turun 7px biar pas)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px "Poppins-Medium", sans-serif';
    const xpText = `${xp.toLocaleString()} / ${nextLevelXp.toLocaleString()} XP`;
    const textWidth = ctx.measureText(xpText).width;
    ctx.fillText(
        xpText,
        progressX + (progressWidth - textWidth) / 2, // Kalau progressWidth dinaikkan, teks makin ke kanan.
        progressY + progressHeight / 2 + 7 // Kalau progressY dinaikkan, teks makin ke bawah.
    );

    // Hasil akhir: buffer PNG dari canvas
    return canvas.toBuffer();
}

module.exports = {
    levelUpXp,
    calculateLevelAndXp,
    addXp,
    generateLevelImage,
};
