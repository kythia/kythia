/**
 * @namespace: addons/economy/helpers/shop.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
	StringSelectMenuBuilder,
} = require('discord.js');
const shopData = require('./items');

const allItems = Object.values(shopData).flat();

/**
 * Safely converts a number to its locale string representation,
 * returning a fallback if the value is not a finite number.
 * @param {number} value - The number to convert.
 * @param {string} [fallback='0'] - The fallback string to return if the value is invalid.
 * @returns {string} The locale string representation of the number or the fallback.
 */
function safeLocaleString(value, fallback = '0') {
	return typeof value === 'number' && Number.isFinite(value)
		? value.toLocaleString()
		: fallback;
}

async function generateShopContainer(
	interaction,
	user,
	category,
	page,
	pageItems,
	componentsBelow = [],
) {
	const { t, kythiaConfig } = interaction.client.container;

	let cashDisplay = '0';
	if (
		user &&
		typeof user.kythiaCoin !== 'undefined' &&
		user.kythiaCoin !== null
	) {
		cashDisplay = safeLocaleString(user.kythiaCoin, '0');
	}
	const headerText = await t(interaction, 'economy.shop.desc', {
		bot: interaction.client.user.username,
		category: category.charAt(0).toUpperCase() + category.slice(1),
		cash: cashDisplay,
	});

	const itemBlocks = [];
	if (pageItems.length === 0) {
		itemBlocks.push(
			new TextDisplayBuilder().setContent(
				`**${await t(interaction, 'economy.shop.empty.title')}**\n${await t(interaction, 'economy.shop.empty.desc')}`,
			),
		);
	} else {
		for (const item of pageItems) {
			const itemName = await t(interaction, item.nameKey);
			const itemDesc = await t(interaction, item.descKey);
			const actualPrice = Math.floor(
				item.price * (user && user.bankType === 'zenith_commerce' ? 0.95 : 1),
			);
			const priceStr = safeLocaleString(actualPrice, '?');
			itemBlocks.push(
				new TextDisplayBuilder().setContent(
					`**${item.emoji} ${itemName} — 🪙 ${priceStr}**\n\`\`\`${itemDesc}\`\`\``,
				),
			);
		}
	}

	const totalPages = Math.max(
		1,
		Math.ceil(
			(category === 'all'
				? allItems.filter((item) => item.buyable)
				: (shopData[category] || []).filter((item) => item.buyable)
			).length / 5,
		),
	);
	page = Math.max(1, Math.min(page, totalPages));

	const footerText = await t(interaction, 'economy.shop.footer', {
		page,
		totalPages,
	});

	const shopContainer = new ContainerBuilder()
		.setAccentColor(
			kythiaConfig.bot.color
				? parseInt(kythiaConfig.bot.color.replace('#', ''), 16)
				: undefined,
		)
		.addTextDisplayComponents(new TextDisplayBuilder().setContent(headerText))
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		)
		.addTextDisplayComponents(...itemBlocks)
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(footerText ?? ''),
		);

	if (componentsBelow?.length) {
		shopContainer
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addActionRowComponents(...componentsBelow);
	}

	return {
		shopContainer,
		pageItems,
		page,
		totalPages,
	};
}

async function generateShopComponentRows(
	interaction,
	page,
	totalPages,
	category,
	pageItems,
	user,
) {
	const { t } = interaction.client.container;
	const categoryOptions = await Promise.all(
		Object.keys(shopData).map(async (cat) => ({
			label: await t(interaction, `economy.shop.category.${cat}`),
			value: `shop_category_${cat}`,
			default: category === cat,
		})),
	);

	const categoryRow = new ActionRowBuilder().addComponents(
		new StringSelectMenuBuilder()
			.setCustomId('select_category')
			.setPlaceholder(
				await t(interaction, 'economy.shop.select.category.placeholder'),
			)
			.addOptions([
				{
					label: await t(interaction, 'economy.shop.category.all'),
					value: 'shop_category_all',
					default: category === 'all',
				},
				...categoryOptions,
			]),
	);

	const buyOptions = await Promise.all(
		pageItems.map(async (item) => {
			const actualPrice = Math.floor(
				item.price * (user && user.bankType === 'zenith_commerce' ? 0.95 : 1),
			);
			return {
				label: await t(interaction, item.nameKey),
				description: await t(interaction, 'economy.shop.item.price', {
					price: safeLocaleString(actualPrice, '?'),
				}),
				value: item.id,
				emoji: item.emoji,
			};
		}),
	);

	const buyRow = new ActionRowBuilder().addComponents(
		new StringSelectMenuBuilder()
			.setCustomId('buy_item')
			.setPlaceholder(await t(interaction, 'economy.shop.buy.placeholder'))
			.setDisabled(pageItems.length === 0)
			.addOptions(buyOptions),
	);

	const navigationRow = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId(`shop_nav_first_${category}`)
			.setLabel(await t(interaction, 'economy.shop.nav.first'))
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(page <= 1),
		new ButtonBuilder()
			.setCustomId(`shop_nav_prev_${category}`)
			.setLabel(await t(interaction, 'economy.shop.nav.prev'))
			.setStyle(ButtonStyle.Primary)
			.setDisabled(page <= 1),
		new ButtonBuilder()
			.setCustomId(`shop_nav_next_${category}`)
			.setLabel(await t(interaction, 'economy.shop.nav.next'))
			.setStyle(ButtonStyle.Primary)
			.setDisabled(page >= totalPages),
		new ButtonBuilder()
			.setCustomId(`shop_nav_last_${category}`)
			.setLabel(await t(interaction, 'economy.shop.nav.last'))
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(page >= totalPages),
	);

	return [categoryRow, buyRow, navigationRow];
}

module.exports = {
	safeLocaleString,
	generateShopContainer,
	generateShopComponentRows,
};
