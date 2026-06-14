/**
 * @namespace: addons/adventure/commands/shop.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const itemsDataFile = require('../helpers/items');
const { BaseCommand } = require('kythia-core');
const shopuiHelper = require('../helpers/shop-ui');

const shopData = itemsDataFile.items;
const allItems = Object.values(shopData).flat();

// Helpers extracted to addons/adventure/helpers/shop-ui.js

class ShopCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('shop')
			.setNameLocalizations({
				id: 'toko',
				fr: 'boutique',
				ja: 'ショップ',
			})
			.setDescription('🛒 Buy items from the adventure shop!')
			.setDescriptionLocalizations({
				id: '🛒 Beli item petualangan di toko',
				fr: "🛒 Achète des objets d'aventure à la boutique !",
				ja: '🛒 冒険アイテムをショップで買おう！',
			})
			.addStringOption((option) =>
				option
					.setName('category')
					.setDescription('The category of items to show')
					.addChoices(
						{
							name: 'All',
							value: 'all',
						},
						...Object.keys(shopData).map((cat) => ({
							name: cat.charAt(0).toUpperCase() + cat.slice(1),
							value: cat,
						})),
					)
					.setRequired(false),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers, logger } = container;
		const { UserAdventure, InventoryAdventure } = models;
		const {
			generateShopContainer,
			generateShopComponentRows,
			getItemsInCategory,
		} = shopuiHelper;
		const { simpleContainer } = helpers.discord;
		await interaction.deferReply();
		const user = await UserAdventure.getCache({
			userId: interaction.user.id,
		});
		if (!user) {
			const msg = await t(interaction, 'adventure.no.character');
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const category = interaction.options.getString('category') || 'equipment';
		let currentPage = 1;
		const { items: pageItems, totalPages } = getItemsInCategory(
			category,
			currentPage,
			5,
		);
		const components = await generateShopComponentRows(
			interaction,
			currentPage,
			totalPages,
			category,
			pageItems,
		);
		const { shopContainer } = await generateShopContainer(
			interaction,
			user,
			category,
			currentPage,
			pageItems,
			components,
		);
		const replyMessage = await interaction.editReply({
			components: [shopContainer],
			flags: MessageFlags.IsComponentsV2,
			fetchReply: true,
		});
		const filter = (i) => i.user.id === interaction.user.id;
		const collector = replyMessage.createMessageComponentCollector({
			filter,
			time: 300000,
		});
		collector.on('collect', async (i) => {
			try {
				await i.deferUpdate();
				let currentCategory = category;
				let userForUpdate = await UserAdventure.getCache({
					userId: interaction.user.id,
				});
				if (i.isStringSelectMenu()) {
					if (i.customId === 'adventure_shop_category') {
						currentCategory = i.values[0].replace('shop_category_', '');
						currentPage = 1;
					} else if (i.customId === 'adventure_shop_select_item') {
						const itemId = i.values[0];
						const item = allItems.find((it) => it.id === itemId);
						if (!item) {
							return i.followUp({
								components: await simpleContainer(
									interaction,
									await t(interaction, 'adventure.shop.item.not.found'),
									{
										color: 'Red',
									},
								),
								flags: MessageFlags.IsComponentsV2,
							});
						}
						if (userForUpdate.gold < item.price) {
							return i.followUp({
								components: await simpleContainer(
									interaction,
									await t(interaction, 'adventure.shop.not.enough.gold', {
										price: item.price,
										gold: userForUpdate.gold,
										item: await t(interaction, item.nameKey),
									}),
								),
								flags: MessageFlags.IsComponentsV2,
							});
						}
						userForUpdate.gold -= item.price;
						await userForUpdate.save();
						const [existingItem, created] =
							await InventoryAdventure.getOrCreateCache(
								{
									userId: userForUpdate.userId,
									itemName: item.id,
								},
								{
									quantity: 1,
								},
							);
						if (!created) {
							existingItem.quantity += 1;
							await existingItem.save();
						}
						await i.followUp({
							components: await simpleContainer(
								interaction,
								await t(interaction, 'adventure.shop.purchase.success', {
									item: await t(interaction, item.nameKey),
									price: item.price,
								}),
							),
							flags: MessageFlags.IsComponentsV2,
						});
						userForUpdate = await UserAdventure.getCache({
							userId: interaction.user.id,
						});
						currentPage = 1;
					}
				} else if (i.isButton()) {
					if (i.customId === 'adventure_shop_page_prev') {
						currentPage = Math.max(1, currentPage - 1);
					} else if (i.customId === 'adventure_shop_page_next') {
						currentPage = currentPage + 1;
					}
				}
				const { items: newPageItems, totalPages: newTotalPages } =
					getItemsInCategory(currentCategory, currentPage, 5);
				currentPage = Math.max(1, Math.min(currentPage, newTotalPages));
				const newComponents = await generateShopComponentRows(
					interaction,
					currentPage,
					newTotalPages,
					currentCategory,
					newPageItems,
				);
				const { shopContainer: newContainer } = await generateShopContainer(
					interaction,
					userForUpdate,
					currentCategory,
					currentPage,
					newPageItems,
					newComponents,
				);
				await i.editReply({
					components: [newContainer],
					flags: MessageFlags.IsComponentsV2,
				});
			} catch (error) {
				logger.error(`Error in shop interaction: ${error.message || error}`, {
					label: 'adventure',
				});
				try {
					await i.followUp({
						content: await t(interaction, 'common.error.generic'),
						flags: MessageFlags.Ephemeral,
					});
				} catch (e) {
					logger.error(`Failed to send error followUp: ${e.message || e}`, {
						label: 'adventure',
					});
				}
			}
		});
		collector.on('end', () => {
			replyMessage
				.edit({
					components: [],
				})
				.catch((err) =>
					logger.error(`Error: ${err.message || err}`, {
						label: 'adventure',
					}),
				);
		});
	}
}
exports.default = ShopCommand;
