/**
 * @namespace: addons/core/select_menus/help-menu.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags } = require('discord.js');

module.exports = {
	execute: async (interaction, container) => {
		const { t, helpers } = container;
		const { getHelpData, buildHelpReply } = helpers.helpUtils;

		const [_, userId, categoryPageStr] = interaction.customId.split(':');

		if (interaction.user.id !== userId) {
			return interaction.reply({
				content: await t(interaction, 'common.error.not.your.interaction'),
				flags: MessageFlags.Ephemeral,
			});
		}

		try {
			await interaction.deferUpdate();
		} catch (_error) {
			return;
		}

		const categoryPage = parseInt(categoryPageStr, 10);
		const selectedCategory = interaction.values[0];
		const docPage = 0;

		const helpData = await getHelpData(container, interaction);
		const totalCategoryPages = Math.ceil(
			helpData.allCategories.length / helpData.CATEGORIES_PER_PAGE,
		);

		const state = {
			userId,
			categoryPage: Math.max(0, Math.min(categoryPage, totalCategoryPages - 1)),
			selectedCategory,
			docPage,
		};

		const updatedReply = await buildHelpReply(
			container,
			interaction,
			state,
			helpData,
		);
		await interaction.editReply(updatedReply).catch(() => {});
	},
};
