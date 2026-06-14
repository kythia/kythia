const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const IMAGES_PER_PAGE = 4;

function buildNavButtons(page, totalPages, allDisabled = false) {
	return [
		new ButtonBuilder()
			.setCustomId('nsfw_fav_first')
			.setLabel('First')
			.setEmoji('⏮️')
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('nsfw_fav_prev')
			.setLabel('Prev')
			.setEmoji('◀️')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('nsfw_fav_next')
			.setLabel('Next')
			.setEmoji('▶️')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(allDisabled || page >= totalPages),
		new ButtonBuilder()
			.setCustomId('nsfw_fav_last')
			.setLabel('Last')
			.setEmoji('⏭️')
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page >= totalPages),
	];
}

async function generateFavContainer(
	interaction,
	page,
	allFavorites,
	navDisabled = false,
) {
	const { helpers } = interaction.client.container;

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

	const [container] = await helpers.discord.createContainer(interaction, {
		title: 'Your NSFW Favorites ❤️',
		description: `Page ${page} of ${totalPages} • Total Favorites: ${allFavorites.length}`,
		media: pageImages,
	});

	const navButtons = buildNavButtons(page, totalPages, navDisabled);
	container.addActionRowComponents(
		new ActionRowBuilder().addComponents(...navButtons),
	);

	return { containerBody: container, page, totalPages };
}

module.exports = {
	buildNavButtons,
	generateFavContainer,
};
