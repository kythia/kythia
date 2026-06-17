/**
 * @namespace: addons/streak/helpers/index.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

async function getOrCreateStreak(container, userId, guildId) {
	const { Streak } = container.models;
	const [userStreak] = await Streak.getOrCreateCache(
		{
			userId: userId,
			guildId: guildId,
		},
		{
			userId,
			guildId,
			currentStreak: 0,
			highestStreak: 0,
			lastClaimTimestamp: null,
			streakFreezes: 0,
		},
	);
	return userStreak;
}
async function updateNickname(
	member,
	streakCount,
	streakEmoji = '🔥',
	streakMinimum = 3,
) {
	let fetchedMember = member;
	try {
		fetchedMember =
			await member.guild.client.container.helpers.discord.getMemberSafe(
				member.guild,
				member.id,
			);
	} catch (_e) {}
	if (!fetchedMember.manageable) {
		return;
	}
	try {
		let currentNickname = fetchedMember.displayName;
		const escapedEmoji = streakEmoji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const streakRegex = new RegExp(`\\s${escapedEmoji}\\s\\d+$`);
		currentNickname = currentNickname.replace(streakRegex, '').trim();
		let newNickname = currentNickname;
		if (streakCount >= streakMinimum) {
			newNickname = `${currentNickname} ${streakEmoji} ${streakCount}`;
		}
		if (newNickname.length > 32) {
			newNickname = newNickname.substring(0, 32);
		}
		if (fetchedMember.displayName !== newNickname) {
			await fetchedMember.setNickname(newNickname);
		}
	} catch (_e) {}
}

/**
 * Returns the current date string (YYYY-MM-DD) in the given IANA timezone.
 * Falls back to the global process timezone (set from kythia.config), then UTC.
 * @param {string} [timezone]
 * @returns {string}
 */
function getTodayDateString(timezone) {
	const tz = timezone || process.env.TZ || 'UTC';
	return new Date().toLocaleDateString('en-CA', {
		timeZone: tz,
	}); // 'en-CA' gives YYYY-MM-DD
}

/**
 * Returns yesterday's date string (YYYY-MM-DD) in the given IANA timezone.
 * @param {string} [timezone]
 * @returns {string}
 */
function getYesterdayDateString(timezone) {
	const tz = timezone || process.env.TZ || 'UTC';
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	return yesterday.toLocaleDateString('en-CA', {
		timeZone: tz,
	});
}
function getMissedDays(lastClaimDateStr, timezone) {
	if (!lastClaimDateStr) return Infinity;
	const todayMs = new Date(getTodayDateString(timezone)).getTime();
	const lastMs = new Date(lastClaimDateStr).getTime();
	const diff = (todayMs - lastMs) / (1000 * 60 * 60 * 24);
	return Math.round(diff);
}
async function syncStreakRoles(member, streakCount, streakRoleRewards) {
	if (!Array.isArray(streakRoleRewards) || streakRoleRewards.length === 0)
		return [];
	let fetchedMember;
	try {
		fetchedMember =
			await member.guild.client.container.helpers.discord.getMemberSafe(
				member.guild,
				member.id,
			);
	} catch (_e) {
		return [];
	}
	if (!fetchedMember.manageable) return [];
	const allRewardRoles = [...new Set(streakRoleRewards.map((r) => r.role))];
	const rolesToHave = [
		...new Set(
			streakRoleRewards
				.filter((r) => streakCount >= r.streak)
				.map((r) => r.role),
		),
	];
	const rolesToRemove = allRewardRoles.filter(
		(roleId) => !rolesToHave.includes(roleId),
	);
	const currentRoles = fetchedMember.roles.cache;
	const toAdd = rolesToHave.filter((roleId) => !currentRoles.has(roleId));
	const toRemove = rolesToRemove.filter((roleId) => currentRoles.has(roleId));
	const rolesGiven = [];
	if (toAdd.length > 0) {
		try {
			await fetchedMember.roles.add(
				toAdd,
				`Streak reward: reached ${streakCount} days`,
			);
			rolesGiven.push(...toAdd);
		} catch (_e) {}
	}
	if (toRemove.length > 0) {
		try {
			await fetchedMember.roles.remove(
				toRemove,
				`Streak loss/reset: current streak ${streakCount} days`,
			);
		} catch (_e) {}
	}
	return rolesGiven;
}
async function restoreStreak(container, member, settings) {
	const userId = member.id;
	const guildId = member.guild.id;
	const timezone = settings.streakTimezone || null;
	const today = getTodayDateString(timezone);
	const streak = await getOrCreateStreak(container, userId, guildId);
	const previousStreak = streak.currentStreak;
	streak.currentStreak = previousStreak + 1;
	if (streak.currentStreak > (streak.highestStreak || 0)) {
		streak.highestStreak = streak.currentStreak;
	}
	streak.lastClaimTimestamp = new Date(today);
	await streak.save();
	const streakEmoji = settings.streakEmoji || '🔥';
	const streakMinimum = settings.streakMinimum || 3;
	const updateStreakNickname = settings.streakNickname || false;
	if (updateStreakNickname) {
		await updateNickname(
			member,
			streak.currentStreak,
			streakEmoji,
			streakMinimum,
		);
	}
	const rewards = Array.isArray(settings.streakRoleRewards)
		? settings.streakRoleRewards
		: [];
	const rewardRolesGiven = await syncStreakRoles(
		member,
		streak.currentStreak,
		rewards,
	);
	return {
		streak,
		rewardRolesGiven,
	};
}
async function claimStreak(container, member, settings) {
	const userId = member.id;
	const guildId = member.guild.id;
	const timezone = settings.streakTimezone || null;
	const streak = await getOrCreateStreak(container, userId, guildId);
	const today = getTodayDateString(timezone);
	const yesterday = getYesterdayDateString(timezone);
	const lastClaimDateStr = streak.lastClaimTimestamp
		? new Date(streak.lastClaimTimestamp).toISOString().slice(0, 10)
		: null;
	if (lastClaimDateStr === today) {
		return {
			status: 'ALREADY_CLAIMED',
			streak,
		};
	}
	let status = 'CONTINUE';
	if (lastClaimDateStr !== yesterday && streak.currentStreak > 0) {
		const missed = getMissedDays(lastClaimDateStr, timezone);
		if (streak.streakFreezes > 0) {
			streak.streakFreezes -= 1;
			streak.currentStreak += 1;
			status = 'FREEZE_USED';
		} else if (missed === 1) {
			// Missed exactly 1 day — offer restore via vote, don't save yet
			// Snapshot lastStreak now so /streak restore can use it
			streak.lastStreak = streak.currentStreak;
			return {
				status: 'CAN_RESTORE',
				streak,
			};
		} else {
			// Lost more than 1 day — snapshot then reset
			streak.lastStreak = streak.currentStreak;
			streak.currentStreak = 1;
			status = 'RESET';
		}
	} else if (lastClaimDateStr === yesterday) {
		streak.currentStreak += 1;
		status = 'CONTINUE';
	} else {
		streak.currentStreak = 1;
		status = 'NEW';
	}
	if (streak.currentStreak > (streak.highestStreak || 0)) {
		streak.highestStreak = streak.currentStreak;
	}
	streak.lastClaimTimestamp = new Date(today);
	await streak.save();
	const streakEmoji = settings.streakEmoji || '🔥';
	const streakMinimum = settings.streakMinimum || 3;
	const updateStreakNickname = settings.streakNickname || false;
	if (updateStreakNickname) {
		await updateNickname(
			member,
			streak.currentStreak,
			streakEmoji,
			streakMinimum,
		);
	}
	const rewards = Array.isArray(settings.streakRoleRewards)
		? settings.streakRoleRewards
		: [];
	let rewardRolesGiven = [];
	rewardRolesGiven = await syncStreakRoles(
		member,
		streak.currentStreak,
		rewards,
	);
	return {
		status,
		streak,
		rewardRolesGiven,
	};
}

/**
 * Restores a user's streak to their last recorded streak value.
 * - Only possible if lastStreak > 0.
 * - Blocked if lastRestoreTimestamp is set (already restored this specific loss).
 * - Blocked if the guild's monthly restore quota has been reached.
 * - After restore: currentStreak = lastStreak, lastStreak = 0, lastRestoreTimestamp = now,
 *   restoreCount incremented, restoreMonthKey updated.
 *
 * @param {object} container
 * @param {import('discord.js').GuildMember} member
 * @param {object} settings  ServerSetting row
 * @returns {Promise<{ status: 'SUCCESS'|'NO_STREAK_TO_RESTORE'|'ALREADY_RESTORED'|'QUOTA_EXCEEDED', streak: object, rewardRolesGiven?: string[], restoreCount?: number, restoreQuota?: number }>}
 */
async function restoreLastStreak(container, member, settings) {
	const userId = member.id;
	const guildId = member.guild.id;
	const timezone = settings.streakTimezone || null;
	const today = getTodayDateString(timezone);
	const tz = timezone || process.env.TZ || 'UTC';

	// Current month key in the guild's timezone (e.g. "2026-05")
	const currentMonthKey = new Date()
		.toLocaleDateString('en-CA', {
			timeZone: tz,
		})
		.slice(0, 7);

	// Max restores per calendar month (configurable, default 5)
	const restoreQuota =
		typeof settings.streakRestoreQuota === 'number'
			? settings.streakRestoreQuota
			: 5;
	const streak = await getOrCreateStreak(container, userId, guildId);

	// Nothing to restore
	if (!streak.lastStreak || streak.lastStreak <= 0) {
		return {
			status: 'NO_STREAK_TO_RESTORE',
			streak,
			restoreQuota,
		};
	}

	// Already restored this specific loss
	if (streak.lastRestoreTimestamp) {
		return {
			status: 'ALREADY_RESTORED',
			streak,
			restoreQuota,
		};
	}

	// Auto-reset the monthly counter if we're in a new month
	if (streak.restoreMonthKey !== currentMonthKey) {
		streak.restoreCount = 0;
		streak.restoreMonthKey = currentMonthKey;
	}

	// Quota check
	const usedThisMonth = streak.restoreCount ?? 0;
	if (usedThisMonth >= restoreQuota) {
		return {
			status: 'QUOTA_EXCEEDED',
			streak,
			restoreCount: usedThisMonth,
			restoreQuota,
		};
	}

	// Perform restore
	const restoredCount = streak.lastStreak || streak.highestStreak;
	streak.currentStreak = restoredCount;
	streak.lastStreak = 0; // consumed — cleared so they can't re-restore the same loss
	streak.lastRestoreTimestamp = new Date();
	streak.lastClaimTimestamp = new Date(today);
	streak.restoreCount = usedThisMonth + 1;
	streak.restoreMonthKey = currentMonthKey;
	if (streak.currentStreak > (streak.highestStreak || 0)) {
		streak.highestStreak = streak.currentStreak;
	}
	await streak.save();
	const streakEmoji = settings.streakEmoji || '🔥';
	const streakMinimum = settings.streakMinimum || 3;
	const updateStreakNickname = settings.streakNickname || false;
	if (updateStreakNickname) {
		await updateNickname(
			member,
			streak.currentStreak,
			streakEmoji,
			streakMinimum,
		);
	}
	const rewards = Array.isArray(settings.streakRoleRewards)
		? settings.streakRoleRewards
		: [];
	const rewardRolesGiven = await syncStreakRoles(
		member,
		streak.currentStreak,
		rewards,
	);
	return {
		status: 'SUCCESS',
		streak,
		rewardRolesGiven,
		restoreCount: streak.restoreCount,
		restoreQuota,
	};
}
module.exports = {
	getOrCreateStreak,
	updateNickname,
	getTodayDateString,
	getYesterdayDateString,
	getMissedDays,
	syncStreakRoles,
	claimStreak,
	restoreStreak,
	restoreLastStreak,
};
