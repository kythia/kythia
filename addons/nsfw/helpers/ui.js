const IMAGES_PER_PAGE = 4;

async function generateFavContainer(
	interaction,
	page,
	allFavorites,
	navDisabled = false,
) {
	const { helpers } = interaction.client.container;
	const { createPaginationContainer } = helpers.discord;

	const totalPages = Math.max(
		1,
		Math.ceil(allFavorites.length / IMAGES_PER_PAGE),
	);
	page = Math.max(1, Math.min(page, totalPages));

	const startIndex = (page - 1) * IMAGES_PER_PAGE;
	const pageImages = allFavorites.slice(
		startIndex,
		startIndex + IMAGES_PER_PAGE,
	);

	const [containerBody] = await createPaginationContainer(interaction, {
		page,
		totalPages,
		title: '## Your NSFW Favorites ❤️',
		media: pageImages,
		footer: `Total Favorites: ${allFavorites.length}`,
		customIdPrefix: 'nsfw_fav',
		navDisabled,
	});

	return { containerBody, page, totalPages };
}

module.exports = {
	generateFavContainer,
};
