/**
 * @namespace: addons/core/helpers/role-unprefix.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Remove role prefix (Logic sama: Fetch + Sleep)
 */
async function roleUnprefix(guild, container) {
	const { logger } = container;
	const prefixPattern = /^([^\w\d\s]{1,5}(?:\s?•)?)\s?/;
	let updated = 0;
	let allMembers;
	try {
		allMembers = await container.helpers.discord.getAllMembersSafe(guild);
	} catch (e) {
		logger.error(`Fetch failed: ${e.message}`, {
			label: 'roleunprefix',
		});
		return 0;
	}
	for (const member of allMembers.values()) {
		const isBotSelf = member.id === guild.client.user.id;
		if (!member.manageable && !isBotSelf) continue;
		const currentNick = member.nickname;
		if (!currentNick || !prefixPattern.test(currentNick)) continue;
		const baseName = currentNick.replace(prefixPattern, '');
		if (currentNick !== baseName) {
			try {
				await member.setNickname(baseName);
				updated++;
				await sleep(1000);
			} catch (err) {
				logger.warn(
					`Failed nick reset for ${member.user.tag}: ${err.message}`,
					{
						label: 'core',
					},
				);
			}
		}
	}
	return updated;
}
module.exports = roleUnprefix;
