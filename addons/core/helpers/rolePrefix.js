/**
 * @namespace: addons/core/helpers/role-prefix.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Set role prefix to member nicknames, with fetch & delay safety.
 * @param {import('discord.js').Guild} guild
 * @param {object} interaction
 */
async function rolePrefix(guild, container) {
	const { logger } = container;
	const prefixPattern = /^([^\w\d\s@]{1,5}(?:\s?•)?)/;

	const prefixRoles = guild.roles.cache
		.filter((role) => prefixPattern.test(role.name))
		.sort((a, b) => b.position - a.position)
		.map((role) => {
			const match = role.name.match(prefixPattern);
			return {
				roleId: role.id,
				prefix: match ? match[1] : '',
				position: role.position,
			};
		});

	if (prefixRoles.length === 0) return 0;

	let updated = 0;

	let allMembers;
	try {
		allMembers = await guild.members.fetch();
	} catch (e) {
		logger.error(`Failed to fetch members for ${guild.name}: ${e.message}`, {
			label: 'roleprefix',
		});
		return 0;
	}

	for (const member of allMembers.values()) {
		const isBotSelf = member.id === guild.client.user.id;

		if (!member.manageable && !isBotSelf) continue;

		const matching = prefixRoles.find((r) => member.roles.cache.has(r.roleId));
		if (!matching) continue;

		const currentNick = member.nickname || member.user.username;

		const baseName = currentNick.replace(prefixPattern, '').trimStart();

		const newNick = `${matching.prefix} ${baseName}`;

		if (currentNick !== newNick) {
			try {
				await member.setNickname(newNick);
				updated++;

				await sleep(1000);
			} catch (err) {
				logger.warn(
					`❌ Failed nick update for ${member.user.tag}: ${err.message}`,
					{ label: 'core' },
				);
			}
		}
	}

	return updated;
}

module.exports = rolePrefix;
