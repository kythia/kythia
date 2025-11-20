/**
 * @namespace: addons/streak/events/messageCreate.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const Streak = require('../database/models/Streak');
const ServerSetting = require('@coreModels/ServerSetting');

/**
 * Auto-claim streak on any message in a guild (except bots).
 * @param {import('../../src/Bot')} bot - Instance of main Bot class.
 * @param {import('discord.js').Message} message - The message object.
 */
module.exports = async (bot, message) => {
    // Only process real users in guilds
    if (!message || message.author?.bot || !message.guild || !message.member) return;

    const userId = message.author.id;
    const guildId = message.guild.id;

    const settings = ServerSetting.getCache({ guildId: guildId });
    if (!settings || !settings.streakOn) return;

    // Get or create streak record for this user in this guild
    let streak = await Streak.getCache({ userId, guildId });
    if (!streak) {
        streak = await Streak.create({
            userId,
            guildId,
            currentStreak: 1,
            lastClaimTimestamp: new Date(),
            highestStreak: 1,
            streakFreezes: 0,
        });
        return;
    }

    // Check if user already claimed today
    const now = new Date();
    const lastClaim = streak.lastClaimTimestamp ? new Date(streak.lastClaimTimestamp) : null;

    // Calculate if last claim was "yesterday" (local time, but for simplicity use UTC)
    let isNewDay = false;
    if (!lastClaim) {
        isNewDay = true;
    } else {
        // Compare date parts (year, month, day)
        const last = { y: lastClaim.getUTCFullYear(), m: lastClaim.getUTCMonth(), d: lastClaim.getUTCDate() };
        const curr = { y: now.getUTCFullYear(), m: now.getUTCMonth(), d: now.getUTCDate() };
        // If not same day, and last claim was before today
        if (curr.y > last.y || curr.m > last.m || curr.d > last.d) {
            isNewDay = true;
        }
    }

    if (isNewDay) {
        // If last claim was exactly yesterday, increment streak
        let shouldContinue = false;
        if (lastClaim) {
            // Get difference in days
            const msPerDay = 24 * 60 * 60 * 1000;
            const lastDay = Date.UTC(lastClaim.getUTCFullYear(), lastClaim.getUTCMonth(), lastClaim.getUTCDate());
            const currDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
            const diffDays = Math.floor((currDay - lastDay) / msPerDay);
            if (diffDays === 1) {
                shouldContinue = true;
            } else {
                shouldContinue = false;
            }
        } else {
            shouldContinue = true;
        }

        if (shouldContinue) {
            streak.currentStreak += 1;
        } else {
            streak.currentStreak = 1;
        }

        streak.lastClaimTimestamp = now;
        if (streak.currentStreak > (streak.highestStreak || 0)) {
            streak.highestStreak = streak.currentStreak;
        }
        await streak.saveAndUpdateCache(['userId', 'guildId']);
    }
};
