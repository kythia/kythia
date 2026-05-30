/**
 * @namespace: addons/nsfw/buttons/nsfw_refresh.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { buildComponentRows } = require('../helpers/buttons.js');
const { fetchContent } = require('../helpers/api.js');

module.exports = {
	execute: async (interaction, container) => {
		const { t, helpers, models, logger } = container;
		const { NsfwUser } = models;

		const ownerId = interaction.message.interaction?.user?.id;
		if (ownerId && ownerId !== interaction.user.id) {
			return interaction.reply({
				content: await t(interaction, 'common.pagination.not.your.interaction'),
				flags: MessageFlags.Ephemeral,
			});
		}

		await interaction.deferUpdate();

		const { extractInteractionData } = require('../helpers/buttons.js');
		const { category, images } = await extractInteractionData(
			interaction,
			container,
		);
		const amount = images.length || 1;

		let user = await NsfwUser.getCache({ userId: interaction.user.id });
		if (!user) {
			user = await NsfwUser.create({
				userId: interaction.user.id,
				nsfwFav: [],
				nsfwCount: 0,
			});
		}

		// Fetch images in parallel
		const fetchPromises = Array.from({ length: amount }, () =>
			fetchContent(category, logger),
		);
		const fetched = await Promise.all(fetchPromises);
		const currentImages = fetched.filter((img) => img !== null);

		if (currentImages.length === 0) {
			return interaction.followUp({
				content:
					'Oops, the image servers seem to be down right now 😭. Please try again later!',
				flags: MessageFlags.Ephemeral,
			});
		}

		// Update nsfwCount
		user.nsfwCount = (user.nsfwCount || 0) + currentImages.length;
		await user.save();

		const [containerBody] = await helpers.discord.createContainer(interaction, {
			title: category,
			media: currentImages,
			components: buildComponentRows(currentImages, user.nsfwFav || []),
		});

		await interaction.editReply({
			components: [containerBody],
		});

		if (container.redis) {
			await container.redis.set(
				`nsfw:msg:${interaction.message.id}:img`,
				JSON.stringify(currentImages),
				'EX',
				86400 * 3,
			);
		}
	},
};
