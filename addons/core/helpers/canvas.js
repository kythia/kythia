/**
 * @namespace: addons/core/helpers/canvas.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { resolvePlaceholders, getGuildSafe } = require('./discord');

const resolvePreviewText = async (text, _type, guildId, container, client) => {
	if (!text) return undefined;

	let data = {
		username: 'Kythia User',
		tag: 'Kythia#0000',
		userId: '123456789012345678',
		guildName: 'Kythia Universe',
		members: 1337,
		boosts: 10,
	};

	let locale = 'en-US';

	if (guildId && client && container) {
		const guild = await getGuildSafe(client, guildId);
		if (guild) {
			data = {
				...data,
				guildName: guild.name,
				members: guild.memberCount,
				boosts: guild.premiumSubscriptionCount || 0,
				ownerId: guild.ownerId,
				guildId: guild.id,
				createdAt: guild.createdAt,
				verified: guild.verified,
				partnered: guild.partnered,
			};
			locale = guild.preferredLocale || 'en-US';
		}
	}

	try {
		if (container && container.t) {
			const result = await resolvePlaceholders(container, text, data, locale);
			if (result) return result;
		}
	} catch (e) {
		if (container && container.logger) {
			container.logger.error(`Error resolving placeholders: ${e.message || e}`);
		}
	}

	// Fallback logic
	const replacements = {
		'{username}': data.username,
		'{tag}': data.tag,
		'{userId}': data.userId,
		'{guildName}': data.guildName,
		'{members}': data.members.toString(),
		'{mention}': `@${data.username}`,
		'{membercount}': data.members.toString(),
		'{boosts}': data.boosts.toString(),
		'{boostcount}': data.boosts.toString(),
	};

	let result = text;
	for (const [key, value] of Object.entries(replacements)) {
		result = result.replace(
			new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
			value,
		);
	}
	return result;
};

module.exports = {
	resolvePreviewText,
};
