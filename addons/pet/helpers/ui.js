/**
 * @namespace: addons/pet/helpers/ui.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const PETS_PER_PAGE = 10;
async function generatePetListContainer(
	interaction,
	page,
	allPets,
	totalPets,
	navDisabled = false,
) {
	const { t, helpers } = interaction.client.container;
	const { createPaginationContainer } = helpers.discord;
	const totalPages = Math.max(1, Math.ceil(totalPets / PETS_PER_PAGE));
	page = Math.max(1, Math.min(page, totalPages));
	const startIndex = (page - 1) * PETS_PER_PAGE;
	const pagePets = allPets.slice(startIndex, startIndex + PETS_PER_PAGE);
	let petListText = '';
	if (pagePets.length === 0) {
		petListText = await t(
			interaction,
			'pet.helpers.ui.admin.list.list.empty.desc',
		);
	} else {
		const entries = await Promise.all(
			pagePets.map(async (pet) => {
				return `**> ${pet.icon} ${pet.name}**\n${await t(
					interaction,
					'pet.helpers.ui.admin.list.list.field',
					{
						rarity: pet.rarity,
						bonusType: pet.bonusType ? pet.bonusType.toUpperCase() : 'UNKNOWN',
						bonusValue: pet.bonusValue,
					},
				)}`;
			}),
		);
		petListText = entries.join('\n\n');
	}
	const [petListContainer] = await createPaginationContainer(interaction, {
		page,
		totalPages,
		title: await t(interaction, 'pet.helpers.ui.admin.list.list.title_md'),
		content: petListText,
		footer: await t(interaction, 'pet.helpers.ui.admin.list.list.footer', {
			page,
			totalPages,
			total: totalPets,
		}),
		customIdPrefix: 'pets',
		navDisabled,
	});
	return {
		petListContainer,
		page,
		totalPages,
	};
}
module.exports = {
	generatePetListContainer,
};
