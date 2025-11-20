/**
 * @namespace: addons/streak/helpers/index.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const Streak = require('../database/models/Streak');

async function getOrCreateStreak(userId, guildId) {
    let userStreak = await Streak.getCache({ userId: userId, guildId: guildId });
    if (!userStreak) {
        userStreak = await Streak.create({
            userId,
            guildId,
            currentStreak: 0,
            highestStreak: 0,
            lastClaimTimestamp: null,
            streakFreezes: 0,
        });
    }
    return userStreak;
}

async function updateNickname(member, streakCount, streakEmoji = '🔥', streakMinimum = 3) {
    if (!member.manageable) {
        console.log(`Bot cant change nickname: ${member.user.username}`);
        return;
    }
    try {
        let currentNickname = member.nickname || member.user.username;

        const streakRegex = new RegExp(`^\\[${streakEmoji}\\s\\d+\\]\\s*`);
        currentNickname = currentNickname.replace(streakRegex, '').trim();

        let newNickname = currentNickname;
        if (streakCount >= streakMinimum) {
            newNickname = `${currentNickname} ${streakEmoji} ${streakCount}`;
        }
        if (newNickname.length > 32) {
            newNickname = newNickname.substring(0, 32);
        }
        if (member.displayName !== newNickname) {
            await member.setNickname(newNickname);
        }
    } catch (error) {
        console.error(`Failed to update ${member.user.username} username:`, error);
    }
}

function getTodayDateString() {
    return new Date().toISOString().slice(0, 10);
}

function getYesterdayDateString() {
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    return yesterday.toISOString().slice(0, 10);
}

async function giveStreakRoleReward(member, streakCount, streakRoleReward) {
    if (!Array.isArray(streakRoleReward) || streakRoleReward.length === 0) return [];
    if (!member.manageable) return [];

    const sortedRewards = [...streakRoleReward].sort((a, b) => a.streak - b.streak);
    const rolesToGive = sortedRewards.filter((r) => streakCount >= r.streak).map((r) => r.role);

    const rolesGiven = [];
    for (const roleId of rolesToGive) {
        try {
            if (!member.roles.cache.has(roleId)) {
                await member.roles.add(roleId, `Streak reward: reached ${streakCount} days`);
                rolesGiven.push(roleId);
            }
        } catch (e) {}
    }
    return rolesGiven;
}

module.exports = {
    getOrCreateStreak,
    updateNickname,
    getTodayDateString,
    getYesterdayDateString,
    giveStreakRoleReward,
};
