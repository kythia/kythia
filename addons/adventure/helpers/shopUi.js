/**
 * @namespace: addons/adventure/helpers/shopUi.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ButtonStyle,
	ButtonBuilder,
	ActionRowBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
	StringSelectMenuBuilder,
} = require('discord.js');

const itemsDataFile = require('./items');
const shopData = itemsDataFile.items;
const allItems = Object.values(shopData).flat();

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
	const container = interaction.client.container;
	const { t, kythiaConfig, helpers } = container;
	const { convertColor } = helpers.color;

	let goldDisplay = '0';
	if (user && typeof user.gold !== 'undefined' && user.gold !== null) {
		goldDisplay = safeLocaleString(user.gold, '0');
	}

	const headerText = await t(interaction, 'adventure.shop.desc', {
		bot: interaction.client.user.username,
		category: await t(interaction, `adventure.shop.category.${category}`),
		gold: goldDisplay,
	});

	const itemBlocks = [];
	if (pageItems.length === 0) {
		itemBlocks.push(
			new TextDisplayBuilder().setContent(
				`**${await t(interaction, 'adventure.shop.empty.title')}**\n${await t(interaction, 'adventure.shop.empty.desc')}`,
			),
		);
	} else {
		for (const item of pageItems) {
			const itemName = await t(interaction, item.nameKey);
			const itemDesc = await t(interaction, item.descKey);
			const priceStr = safeLocaleString(item.price, '?');
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

	const footerText = await t(interaction, 'adventure.shop.footer', {
		page,
		totalPages,
	});

	const shopContainer = new ContainerBuilder()
		.setAccentColor(
			convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }),
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
			new TextDisplayBuilder().setContent(footerText || ''),
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
) {
	const t = interaction.client.container.t;

	const categoryOptions = await Promise.all(
		Object.keys(shopData).map(async (cat) => ({
			label: await t(interaction, `adventure.shop.category.${cat}`),
			value: `shop_category_${cat}`,
			default: category === cat,
		})),
	);

	const rows = [];

	const categoryRow = new ActionRowBuilder().addComponents(
		new StringSelectMenuBuilder()
			.setCustomId('adventure_shop_category')
			.setPlaceholder(await t(interaction, 'adventure.shop.select.category'))
			.addOptions(categoryOptions),
	);
	rows.push(categoryRow);

	if (pageItems.length > 0) {
		const itemOptions = await Promise.all(
			pageItems.map(async (item) => ({
				label: await t(interaction, item.nameKey),
				description: await t(interaction, 'adventure.shop.select.option.desc', {
					price: item.price,
				}),
				value: item.id,
				emoji: item.emoji,
			})),
		);

		rows.push(
			new ActionRowBuilder().addComponents(
				new StringSelectMenuBuilder()
					.setCustomId('adventure_shop_select_item')
					.setPlaceholder(
						await t(interaction, 'adventure.shop.select.item.placeholder'),
					)
					.addOptions(itemOptions),
			),
		);
	}

	const navButtons = [];
	if (page > 1) {
		navButtons.push(
			new ButtonBuilder()
				.setCustomId('adventure_shop_page_prev')
				.setLabel(await t(interaction, 'common.previous'))
				.setStyle(ButtonStyle.Secondary),
		);
	}

	if (page < totalPages) {
		navButtons.push(
			new ButtonBuilder()
				.setCustomId('adventure_shop_page_next')
				.setLabel(await t(interaction, 'common.next'))
				.setStyle(ButtonStyle.Primary),
		);
	}

	if (navButtons.length > 0) {
		rows.push(new ActionRowBuilder().addComponents(navButtons));
	}

	return rows;
}

function getItemsInCategory(category, page = 1, itemsPerPage = 5) {
	const items =
		category === 'all'
			? allItems.filter((item) => item.buyable)
			: (shopData[category] || []).filter((item) => item.buyable);

	const startIdx = (page - 1) * itemsPerPage;
	const endIdx = startIdx + itemsPerPage;

	return {
		items: items.slice(startIdx, endIdx),
		totalItems: items.length,
		totalPages: Math.ceil(items.length / itemsPerPage),
	};
}

module.exports = {
	safeLocaleString,
	generateShopContainer,
	generateShopComponentRows,
	getItemsInCategory,
};
