/**
 * @namespace: addons/economy/commands/shop.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	MessageFlags,
	ContainerBuilder,
	TextDisplayBuilder,
} = require('discord.js');
const shopData = require('../helpers/items');
const { toBigIntSafe } = require('../helpers/bigint');
const { BaseCommand } = require('kythia-core');
const shopHelper = require('../helpers/shop');

const allItems = Object.values(shopData).flat();

// Helpers extracted to addons/economy/helpers/shop.js

class ShopCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('shop')
			.setDescription('🛒 Look and buy items from the shop.');
	async execute(interaction) {
		const { t, kythiaConfig, models } = interaction.client.container;
		const { KythiaUser, Inventory } = models;
		const {
			generateShopComponentRows,
			generateShopContainer,
			safeLocaleString,
		} = shopHelper;
		await interaction.deferReply();
		let user = await KythiaUser.getCache({
			userId: interaction.user.id,
		});
		if (!user) {
			const errShopContainer = new ContainerBuilder()
				.setAccentColor(
					kythiaConfig.bot.color
						? parseInt(kythiaConfig.bot.color.replace('#', ''), 16)
						: undefined,
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await t(interaction, 'economy.withdraw.no.account.desc'),
					),
				)
				.addTextDisplayComponents(new TextDisplayBuilder().setContent(''));
			return interaction.reply({
				components: [errShopContainer],
				flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
			});
		}
		let currentPage = 1;
		let currentCategory = 'all';
		const itemsToShow =
			currentCategory === 'all'
				? allItems.filter((item) => item.buyable)
				: (shopData[currentCategory] || []).filter((item) => item.buyable);
		let totalPages = Math.max(1, Math.ceil(itemsToShow.length / 5));
		let pageItems = itemsToShow.slice(0, 5);
		const components = await generateShopComponentRows(
			interaction,
			currentPage,
			totalPages,
			currentCategory,
			pageItems,
			user,
		);
		const { shopContainer } = await generateShopContainer(
			interaction,
			user,
			currentCategory,
			currentPage,
			pageItems,
			components,
		);
		const message = await interaction.editReply({
			components: [shopContainer],
			flags: MessageFlags.IsComponentsV2,
			fetchReply: true,
		});
		const collector = message.createMessageComponentCollector({
			time: 300000,
		});
		collector.on('collect', async (i) => {
			const { t } = interaction.client.container;
			if (i.user.id !== interaction.user.id) {
				const errShopContainer = new ContainerBuilder()
					.setAccentColor(
						kythiaConfig.bot.color
							? parseInt(kythiaConfig.bot.color.replace('#', ''), 16)
							: undefined,
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							await t(i, 'economy.shop.not.your.interaction.desc'),
						),
					);
				return i.reply({
					components: [errShopContainer],
					flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
				});
			}
			await i.deferUpdate();
			if (i.customId === 'select_category') {
				const selected = i.values[0];
				currentCategory = selected.replace('shop_category_', '');
				currentPage = 1;
			} else if (i.customId.startsWith('shop_nav_')) {
				const parts = i.customId.split('_');
				const navType = parts[2];
				const navCategory = parts.slice(3).join('_');
				if (navCategory) currentCategory = navCategory;
				if (navType === 'next') currentPage++;
				if (navType === 'prev') currentPage--;
				if (navType === 'first') currentPage = 1;
				if (navType === 'last') {
					const navItemsToShow =
						currentCategory === 'all'
							? allItems.filter((item) => item.buyable)
							: (shopData[currentCategory] || []).filter(
									(item) => item.buyable,
								);
					currentPage = Math.max(1, Math.ceil(navItemsToShow.length / 5));
				}
			} else if (i.customId === 'buy_item') {
				const itemId = i.values[0];
				const selectedItem = allItems.find((item) => item.id === itemId);
				if (!selectedItem) {
					const errShopContainer = new ContainerBuilder()
						.setAccentColor(
							kythiaConfig.bot.color
								? parseInt(kythiaConfig.bot.color.replace('#', ''), 16)
								: undefined,
						)
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(
								await t(i, 'economy.shop.item.not.found.desc'),
							),
						);
					return i.followUp({
						components: [errShopContainer],
						flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
					});
				}
				const translatedItemName = await t(interaction, selectedItem.nameKey);
				const itemNameWithEmoji = `${selectedItem.emoji} ${translatedItemName}`;
				user = await KythiaUser.getCache({
					userId: interaction.user.id,
				});
				if (
					!user ||
					typeof user.kythiaCoin !== 'number' ||
					Number.isNaN(user.kythiaCoin)
				) {
					const errShopContainer = new ContainerBuilder()
						.setAccentColor(
							kythiaConfig.bot.color
								? parseInt(kythiaConfig.bot.color.replace('#', ''), 16)
								: undefined,
						)
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(
								await t(i, 'economy.shop.not.enough.money.desc', {
									item: itemNameWithEmoji,
								}),
							),
						);
					return i.followUp({
						components: [errShopContainer],
						flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
					});
				}
				const actualPrice = Math.floor(
					selectedItem.price * (user.bankType === 'zenith_commerce' ? 0.95 : 1),
				);
				if (user.kythiaCoin < actualPrice) {
					const errShopContainer = new ContainerBuilder()
						.setAccentColor(
							kythiaConfig.bot.color
								? parseInt(kythiaConfig.bot.color.replace('#', ''), 16)
								: undefined,
						)
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(
								await t(i, 'economy.shop.not.enough.money.desc', {
									item: itemNameWithEmoji,
								}),
							),
						);
					return i.followUp({
						components: [errShopContainer],
						flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
					});
				}
				user.kythiaCoin =
					toBigIntSafe(user.kythiaCoin) - toBigIntSafe(actualPrice);
				user.changed('kythiaCoin', true);
				await user.save();
				await Inventory.create({
					userId: user.userId,
					itemName: itemNameWithEmoji,
				});
				const priceStr = safeLocaleString(actualPrice, '?');
				const successShopContainer = new ContainerBuilder()
					.setAccentColor(
						kythiaConfig.bot.color
							? parseInt(kythiaConfig.bot.color.replace('#', ''), 16)
							: undefined,
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							await t(i, 'economy.shop.buy.success.desc', {
								item: itemNameWithEmoji,
								price: priceStr,
							}),
						),
					);
				await i.followUp({
					components: [successShopContainer],
					flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
				});
			}
			const itemsToShow =
				currentCategory === 'all'
					? allItems.filter((item) => item.buyable)
					: (shopData[currentCategory] || []).filter((item) => item.buyable);
			totalPages = Math.max(1, Math.ceil(itemsToShow.length / 5));
			currentPage = Math.max(1, Math.min(currentPage, totalPages));
			const startIndex = (currentPage - 1) * 5;
			pageItems = itemsToShow.slice(startIndex, startIndex + 5);
			const newComponents = await generateShopComponentRows(
				interaction,
				currentPage,
				totalPages,
				currentCategory,
				pageItems,
				user,
			);
			const { shopContainer: newShopContainer } = await generateShopContainer(
				interaction,
				await KythiaUser.getCache({
					userId: interaction.user.id,
				}),
				currentCategory,
				currentPage,
				pageItems,
				newComponents,
			);
			await interaction.editReply({
				components: [newShopContainer],
				flags: MessageFlags.IsComponentsV2,
			});
		});
		collector.on('end', async () => {
			try {
				await interaction.editReply({
					components: [],
				});
			} catch {}
		});
	}
}

exports.default = ShopCommand;
