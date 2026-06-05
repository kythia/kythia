/**
 * @namespace: addons/activity/events/guildMemberUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 *
 * Detects when a member starts boosting the server and unlocks
 * the server_booster achievement.
 */

/**
 * @param {import('kythia-core').Kythia} bot
 * @param {import('discord.js').GuildMember} oldMember
 * @param {import('discord.js').GuildMember} newMember
 */
module.exports = async (bot, oldMember, newMember) => {
	if (!newMember?.user || newMember.user.bot) return;

	// Detect boost start: was not boosting before, now is
	const startedBoosting = !oldMember.premiumSince && newMember.premiumSince;
	if (!startedBoosting) return;

	const { models } = bot.client.container;
	const { ServerSetting } = models;

	const guildId = newMember.guild.id;
	const userId = newMember.id;

	const serverSetting = await ServerSetting.getCache({ guildId });
	if (!serverSetting?.activityOn) return;

	const { checkAndUnlock } = require('../helpers/achievementChecker');
	checkAndUnlock('special', {
		guildId,
		userId,
		guild: newMember.guild,
		container: bot.client.container,
		specialFlags: ['server_booster'],
	}).catch(() => null);
};
