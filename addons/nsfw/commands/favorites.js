/**
 * @namespace: addons/nsfw/commands/favorites.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require('discord.js');

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
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('favorites')
			.setDescription('🔞 View your favorited NSFW images')
			.addBooleanOption((option) =>
				option
					.setName('private')
					.setDescription('Make the message private?')
					.setRequired(false),
			),
	voteLocked: true,

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { models } = container;
		const { NsfwUser } = models;

		// Default to true (private) since it's an NSFW personal list
		const ephemeral = interaction.options.getBoolean('private') ?? true;
		await interaction.deferReply({ ephemeral });

		const user = await NsfwUser.getCache({ userId: interaction.user.id });
		if (!user?.nsfwFav || user.nsfwFav.length === 0) {
			return interaction.editReply({
				content: "You haven't favorited any NSFW images yet! 💔",
			});
		}

		const allFavorites = user.nsfwFav;
		let currentPage = 1;

		const { containerBody, totalPages } = await generateFavContainer(
			interaction,
			currentPage,
			allFavorites,
		);

		const message = await interaction.editReply({
			components: [containerBody],
			flags: MessageFlags.IsComponentsV2,
			fetchReply: true,
		});

		if (totalPages <= 1) return;

		const collector = message.createMessageComponentCollector({ time: 300000 });

		collector.on('collect', async (i) => {
			if (i.user.id !== interaction.user.id) {
				return i.reply({
					content: 'This is not your interaction!',
					flags: MessageFlags.Ephemeral,
				});
			}

			if (i.customId === 'nsfw_fav_first') currentPage = 1;
			else if (i.customId === 'nsfw_fav_prev')
				currentPage = Math.max(1, currentPage - 1);
			else if (i.customId === 'nsfw_fav_next')
				currentPage = Math.min(totalPages, currentPage + 1);
			else if (i.customId === 'nsfw_fav_last') currentPage = totalPages;

			const { containerBody: newContainer } = await generateFavContainer(
				i,
				currentPage,
				allFavorites,
			);

			await i.update({
				components: [newContainer],
				flags: MessageFlags.IsComponentsV2,
			});
		});

		collector.on('end', async () => {
			try {
				const { containerBody: finalContainer } = await generateFavContainer(
					interaction,
					currentPage,
					allFavorites,
					true,
				);

				await interaction.editReply({
					components: [finalContainer],
					flags: MessageFlags.IsComponentsV2,
				});
			} catch (_e) {}
		});
	},
};
