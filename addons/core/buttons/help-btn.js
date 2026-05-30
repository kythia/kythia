/**
 * @namespace: addons/core/buttons/help-btn.js
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

		const [_, action, userId, categoryPageStr, selectedCategory, docPageStr] =
			interaction.customId.split(':');

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

		let categoryPage = parseInt(categoryPageStr, 10);
		let docPage = parseInt(docPageStr, 10);
		let category = selectedCategory === '-' ? null : selectedCategory;

		const helpData = await getHelpData(container, interaction);

		if (action === 'cp') categoryPage--;
		if (action === 'cn') categoryPage++;
		if (action === 'dp') docPage--;
		if (action === 'dn') docPage++;
		if (action === 'home') {
			category = null;
			docPage = 0;
		}

		const totalCategoryPages = Math.ceil(
			helpData.allCategories.length / helpData.CATEGORIES_PER_PAGE,
		);
		categoryPage = Math.max(0, Math.min(categoryPage, totalCategoryPages - 1));

		if (category) {
			const totalDocPages = helpData.pages[category]?.length || 1;
			docPage = Math.max(0, Math.min(docPage, totalDocPages - 1));
		}

		const state = {
			userId,
			categoryPage,
			selectedCategory: category,
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
