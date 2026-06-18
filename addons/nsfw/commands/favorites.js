/**
 * @namespace: addons/nsfw/commands/favorites.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
const uiHelper = require('../helpers/ui');

// Helpers extracted to addons/nsfw/helpers/ui.js

class FavoritesCommand extends BaseCommand {
	subcommand = true;
	voteLocked = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('favorites')
			.setDescription('View your favorited mature images')
			.addBooleanOption((option) =>
				option
					.setName('private')
					.setDescription('Make the message private?')
					.setRequired(false),
			);
	async execute(interaction) {
		const container = this.container;
		const { models } = container;
		const { NsfwUser } = models;
		const { generateFavContainer } = uiHelper;

		// Default to true (private) since it's an NSFW personal list
		const ephemeral = interaction.options.getBoolean('private') ?? true;
		await interaction.deferReply({
			ephemeral,
		});
		const user = await NsfwUser.getCache({
			userId: interaction.user.id,
		});
		if (!user?.nsfwFav || user.nsfwFav.length === 0) {
			return interaction.editReply({
				content: await interaction.client.container.t(
					interaction,
					'nsfw.favorites.empty',
				),
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
		const collector = message.createMessageComponentCollector({
			time: 300000,
		});
		collector.on('collect', async (i) => {
			if (i.user.id !== interaction.user.id) {
				return i.reply({
					content: await interaction.client.container.t(
						interaction,
						'nsfw.favorites.not_yours',
					),
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
	}
}
exports.default = FavoritesCommand;
