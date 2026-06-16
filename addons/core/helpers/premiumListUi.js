/**
 * @namespace: addons/core/helpers/premiumListUi.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const USERS_PER_PAGE = 10;

async function generatePremiumListContainer(
	interaction,
	page,
	allPremiumUsers,
	totalUsers,
	navDisabled = false,
) {
	const { t, helpers } = interaction.client.container;
	const { createPaginationContainer } = helpers.discord;

	const totalPages = Math.max(1, Math.ceil(totalUsers / USERS_PER_PAGE));
	page = Math.max(1, Math.min(page, totalPages));

	const startIndex = (page - 1) * USERS_PER_PAGE;
	const pageUsers = allPremiumUsers.slice(
		startIndex,
		startIndex + USERS_PER_PAGE,
	);

	let listText = '';
	if (pageUsers.length === 0) {
		listText = await t(interaction, 'core.premium.premium.list.empty');
	} else {
		const entries = await Promise.all(
			pageUsers.map(async (p, index) => {
				const globalIndex = startIndex + index + 1;
				return await t(interaction, 'core.premium.premium.list.item', {
					index: globalIndex,
					user: `<@${p.userId}>`,
					expires: `<t:${Math.floor(new Date(p.premiumExpiresAt).getTime() / 1000)}:R>`,
				});
			}),
		);
		listText = entries.join('\n');
	}

	const [premiumListContainer] = await createPaginationContainer(interaction, {
		page,
		totalPages,
		title: await t(interaction, 'core.premium.premium.list.title'),
		content: listText,
		footer: await t(interaction, 'core.premium.premium.list.footer', {
			page,
			totalPages,
			totalUsers,
		}),
		customIdPrefix: 'premium_list',
		navDisabled,
	});

	return { premiumListContainer, page, totalPages };
}

module.exports = { generatePremiumListContainer };
