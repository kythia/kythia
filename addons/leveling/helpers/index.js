/**
 * @namespace: addons/leveling/helpers/index.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { createCanvas, loadImage, registerFont } = require('canvas');
const ServerSetting = require('@coreModels/ServerSetting');
const User = require('@coreModels/User');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const { t } = require('@coreHelpers/translator');
const { embedFooter } = require('@coreHelpers/discord');

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

const levelUpXp = (level) => level * level * 50;

const addXp = async (guildId, userId, xpToAdd, message, channel) => {
    if (!channel) {
        const setting = await ServerSetting.getCache({ guildId: message.guild.id });
        if (setting && setting.levelingChannelId) {
            channel = message.guild.channels.cache.get(setting.levelingChannelId) || null;
        }
    }
    let user = await User.getCache({ userId: userId, guildId: guildId });

    if (!user) {
        user = await User.create({ guildId, userId, xp: 0, level: 1 });
    }

    user.xp = Number(BigInt(user.xp) + BigInt(xpToAdd));
    let leveledUp = false;
    const levelBefore = user.level;

    while (user.xp >= levelUpXp(user.level)) {
        user.xp -= levelUpXp(user.level);
        user.level += 1;
        leveledUp = true;
    }

    user.changed('xp', true);
    user.changed('level', true);

    await user.update({ xp: user.xp, level: user.level });
    await user.saveAndUpdateCache();

    if (!leveledUp) return;

    const member = message.guild.members.cache.get(userId);
    const serverSetting = await ServerSetting.getCache({ guildId: message.guild.id });

    let rewardEmbed = null;
    let rewardRoleName = null;
    let rewardLevel = null;
    if (serverSetting && Array.isArray(serverSetting.roleRewards)) {
        const rewards = serverSetting.roleRewards.filter((r) => r.level > levelBefore && r.level <= user.level);

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
        `${await t(message, 'leveling.helpers.index.leveling.profile.up.title')}\n` +
        (await t(message, 'leveling.helpers.index.leveling.profile.up.desc', {
            username: message.author.username,
            mention: message.author.toString(),
            level: user.level || 0,
            xp: user.xp || 0,
            nextLevelXp: levelUpXp(user.level),
        }));

    if (rewardRoleName && rewardLevel) {
        description +=
            `\n\n${await t(message, 'leveling.helpers.index.leveling.role.reward.title')}\n` +
            (await t(message, 'leveling.helpers.index.leveling.role.reward.desc', {
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

    if (channel) {
        if (buffer && (Buffer.isBuffer(buffer) || typeof buffer === 'string')) {
            try {
                levelEmbed.setImage('attachment://level-profile.png');
            } catch (e) {}
            await channel
                .send({
                    embeds: [levelEmbed],
                    files: [{ attachment: buffer, name: 'level-profile.png' }],
                })
                .catch(() => {});
        } else {
            await channel
                .send({
                    embeds: [levelEmbed],
                })
                .catch(() => {});
        }
    }
};

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

/**
 * generateLevelImage
 *
 * Fungsi ini membuat gambar profil level user dengan berbagai elemen visual.
 * Semua angka/posisi di-comment penjelasannya, termasuk efek jika diubah (naik/turun, kanan/kiri).
 */
async function generateLevelImage({ username, avatarURL, level, xp, nextLevelXp, backgroundURL }) {
    const width = 800;
    const height = 250;

    const borderWidth = 5;

    const borderRadius = 25;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = kythia.bot.color;
    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, borderRadius);
    ctx.fill();
    ctx.save();

    ctx.beginPath();
    ctx.roundRect(borderWidth, borderWidth, width - borderWidth * 2, height - borderWidth * 2, borderRadius - 5);
    ctx.clip();

    try {
        if (backgroundURL) {
            let bgImage;
            if (backgroundURL.startsWith('http')) {
                const response = await axios.get(backgroundURL, { responseType: 'arraybuffer' });
                const buffer = Buffer.from(response.data, 'binary');
                bgImage = await loadImage(buffer);
            } else {
                bgImage = await loadImage(path.resolve(backgroundURL));
            }

            ctx.drawImage(bgImage, 0, 0, width, height);
        } else {
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, '#23272a');
            gradient.addColorStop(1, '#2c2f33');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }
    } catch (bgError) {
        console.error('Error loading background:', bgError);
        ctx.fillStyle = '#23272a';
        ctx.fillRect(0, 0, width, height);
    }

    let avatar;
    try {
        const processedAvatarURL = avatarURL.replace(/\.webp\b/i, '.png');
        avatar = await loadImage(processedAvatarURL);
    } catch (avatarError) {
        console.error('Error loading avatar:', avatarError);
    }

    if (avatar) {
        const avatarSize = height - borderWidth * 2 - 80;

        const avatarX = borderWidth + 40;

        const avatarY = borderWidth + 40;

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 2.5, 0, Math.PI * 2, true);
        ctx.lineWidth = 5;
        ctx.strokeStyle = kythia.bot.color;
        ctx.stroke();
        ctx.restore();
    }

    ctx.restore();

    const contentX = 250;

    ctx.font = 'bold 40px "Poppins-Medium", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(username, contentX, 90);

    ctx.font = '28px "Poppins-Bold", sans-serif';
    ctx.fillStyle = kythia.bot.color;
    ctx.fillText(`Level ${level}`, contentX, 130);

    const progressWidth = width - contentX - 40;

    const progressHeight = 30;

    const progressX = contentX;

    const progressY = 180;

    const barRadius = progressHeight / 2;

    ctx.fillStyle = '#444';
    ctx.beginPath();
    ctx.roundRect(progressX, progressY, progressWidth, progressHeight, barRadius);
    ctx.fill();

    const percent = Math.min(Math.max(xp / nextLevelXp, 0), 1);
    if (percent > 0) {
        ctx.save();

        ctx.beginPath();
        ctx.roundRect(progressX, progressY, progressWidth, progressHeight, barRadius);
        ctx.clip();

        ctx.fillStyle = kythia.bot.color;
        ctx.fillRect(progressX, progressY, progressWidth * percent, progressHeight);

        ctx.restore();
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px "Poppins-Medium", sans-serif';
    const xpText = `${xp.toLocaleString()} / ${nextLevelXp.toLocaleString()} XP`;
    const textWidth = ctx.measureText(xpText).width;
    ctx.fillText(xpText, progressX + (progressWidth - textWidth) / 2, progressY + progressHeight / 2 + 7);

    return canvas.toBuffer();
}

module.exports = {
    levelUpXp,
    calculateLevelAndXp,
    addXp,
    generateLevelImage,
};
