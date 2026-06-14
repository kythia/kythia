/**
 * @namespace: addons/checklist/helpers/index.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

/**
 * Helper: Get checklist (with cache) and parse items array safely.
 * @param {Object} options
 * @param {KythiaDI.Container} options.container
 * @param {string} options.guildId
 * @param {string} options.userId
 * @param {boolean} options.createIfNotExist
 */
async function getChecklistAndItems({
	container,
	guildId,
	userId,
	createIfNotExist = false,
}) {
	const { models } = container;
	const { Checklist } = models;
	let checklist;
	if (createIfNotExist) {
		[checklist] = await Checklist.findOrCreateCache({
			where: { guildId, userId },
			defaults: { items: '[]' },
		});
	} else {
		checklist = await Checklist.getCache({ guildId, userId });
	}
	let items = [];
	if (checklist) {
		try {
			if (Array.isArray(checklist.items)) {
				items = checklist.items;
			} else if (typeof checklist.items === 'string') {
				items = JSON.parse(checklist.items);
			} else if (
				typeof checklist.items === 'object' &&
				checklist.items !== null
			) {
				items = checklist.items;
			}
		} catch (_e) {
			items = [];
		}
	}
	if (!Array.isArray(items)) items = [];
	return { checklist, items };
}

/**
 * Helper: Get scope key, color, and ephemeral flag based on userId/group.
 * @param {KythiaDI.Container} container
 * @param {string} userId
 * @param {string} group
 * @param {Object} items
 */
function getScopeMeta(container, userId, group, items = null) {
	const { convertColor } = container.helpers.color;
	const isPersonal = !!userId;
	return {
		scopeKey: isPersonal
			? 'checklist.scope.personal'
			: 'checklist.scope.server',
		color: isPersonal
			? items && items.checked !== undefined
				? items.checked
					? convertColor('Green', { from: 'discord', to: 'decimal' })
					: convertColor('Yellow', { from: 'discord', to: 'decimal' })
				: convertColor('Blue', { from: 'discord', to: 'decimal' })
			: convertColor('Green', { from: 'discord', to: 'decimal' }),
		colorName: isPersonal ? 'Blue' : 'Green',
		ephemeral: group === 'personal',
	};
}

/**
 * Helper: Reply with embed (catch error if already replied).
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {Object} options
 */
async function safeReply(interaction, options) {
	try {
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp(options);
		} else {
			await interaction.reply(options);
		}
	} catch (_e) {
		// fallback: ignore
	}
}

module.exports = {
	getChecklistAndItems,
	getScopeMeta,
	safeReply,
};
