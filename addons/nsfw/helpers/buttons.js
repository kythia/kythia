/**
 * @namespace: addons/nsfw/helpers/buttons.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	MessageFlags,
} = require('discord.js');

const buildComponentRows = (
	images,
	userNsfwFav = [],
	disabled = false,
	refreshLabel = '🔁 Refresh',
	deleteLabel = '🗑️ Delete',
) => {
	const favRow = new ActionRowBuilder();
	const actionRow = new ActionRowBuilder();

	images.forEach((imgUrl, index) => {
		const isFavorited = userNsfwFav.includes(imgUrl);
		favRow.addComponents(
			new ButtonBuilder()
				.setCustomId(`nsfw_fav_${index}`)
				.setLabel(isFavorited ? 'Unfavorite' : `Favorite ${index + 1}`)
				.setEmoji(isFavorited ? '💔' : '❤️')
				.setStyle(isFavorited ? ButtonStyle.Secondary : ButtonStyle.Success)
				.setDisabled(disabled),
		);
	});

	actionRow.addComponents(
		new ButtonBuilder()
			.setCustomId('nsfw_refresh')
			.setLabel(refreshLabel)
			.setStyle(ButtonStyle.Primary)
			.setDisabled(disabled),
		new ButtonBuilder()
			.setCustomId('nsfw_delete')
			.setLabel(deleteLabel)
			.setStyle(ButtonStyle.Danger)
			.setDisabled(disabled),
	);

	return [favRow, actionRow].filter((row) => row.components.length > 0);
};

const extractInteractionData = async (interaction, container) => {
	let category = 'neko';
	let images = [];

	const { redis } = container;
	if (redis && interaction.message) {
		const msgId = interaction.message.id;
		const cachedCat = await redis.get(`nsfw:msg:${msgId}:cat`);
		if (cachedCat) category = cachedCat;

		const cachedImages = await redis.get(`nsfw:msg:${msgId}:img`);
		if (cachedImages) {
			try {
				images = JSON.parse(cachedImages);
			} catch (_e) {}
		}
	}

	if (category === 'neko' && interaction.message?.embeds?.length > 0) {
		category = interaction.message.embeds[0]?.title ?? 'neko';
	}
	if (images.length === 0 && interaction.message?.embeds?.length > 0) {
		images = interaction.message.embeds
			.map((e) => e.image?.url)
			.filter(Boolean);
	}

	return { category, images };
};

const handleFavorite = async (interaction, container, index) => {
	const { t, helpers, models } = container;
	const { NsfwUser } = models;

	const ownerId = interaction.message.interaction?.user?.id;
	if (ownerId && ownerId !== interaction.user.id) {
		return interaction.reply({
			content: await t(interaction, 'common.pagination.not.your.interaction'),
			flags: MessageFlags.Ephemeral,
		});
	}

	await interaction.deferUpdate();

	const [user] = await NsfwUser.getOrCreateCache(
		{ userId: interaction.user.id },
		{
			userId: interaction.user.id,
			nsfwFav: [],
			nsfwCount: 0,
		},
	);

	const { category, images: currentImages } = await extractInteractionData(
		interaction,
		container,
	);
	const imageUrl = currentImages[index];

	if (!imageUrl) return;

	const favSet = new Set(user.nsfwFav || []);

	if (favSet.has(imageUrl)) {
		favSet.delete(imageUrl);
	} else {
		favSet.add(imageUrl);
	}

	user.nsfwFav = Array.from(favSet);
	await user.save();

	const [updatedContainer] = await helpers.discord.createContainer(
		interaction,
		{
			title: category,
			media: currentImages,
			components: buildComponentRows(
				currentImages,
				user.nsfwFav || [],
				false,
				await container.t(interaction, 'nsfw.ui.refresh'),
				await container.t(interaction, 'nsfw.ui.delete'),
			),
		},
	);

	await interaction.editReply({ components: [updatedContainer] });
};

module.exports = {
	buildComponentRows,
	handleFavorite,
	extractInteractionData,
};
