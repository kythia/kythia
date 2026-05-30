/**
 * @namespace: addons/adventure/commands/inventory.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ButtonStyle,
	MessageFlags,
	ButtonBuilder,
	ActionRowBuilder,
} = require('discord.js');
const { items } = require('../helpers/items');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('inventory')
			.setNameLocalizations({
				id: 'inventaris',
				fr: 'inventaire',
				ja: 'インベントリ',
			})
			.setDescription('🎒 Look at your inventory')
			.setDescriptionLocalizations({
				id: '🎒 Lihat inventaris yang kamu punya',
				fr: '🎒 Ton inventaire',
				ja: '🎒 所持品を確認しよう',
			}),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, kythiaConfig, helpers } = container;
		const { UserAdventure, InventoryAdventure } = models;
		const { createContainer } = helpers.discord;

		await interaction.deferReply();
		const userId = interaction.user.id;
		const user = await UserAdventure.getCache({ userId: userId });

		if (!user) {
			const msg = await t(interaction, 'adventure.no.character');
			const components = await createContainer(interaction, {
				description: msg,
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const rawInventory = await InventoryAdventure.getAllCache({
			where: { userId: userId },
			cacheTags: [`InventoryAdventure:inventory:byUser:${userId}`],
		});

		if (rawInventory.length === 0) {
			const msg = await t(interaction, 'adventure.inventory.empty');
			const components = await createContainer(interaction, {
				description: msg,
				color: kythiaConfig.bot.color,
			});

			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const inventoryMap = {};

		for (const item of rawInventory) {
			const id = item.itemName;
			if (!inventoryMap[id]) {
				inventoryMap[id] = { count: 0, id: id };
			}
			inventoryMap[id].count += item.quantity ? Number(item.quantity) : 1;
		}

		const processedInventory = Object.values(inventoryMap).map((itemData) => {
			let itemDef = null;
			const allItems = Object.values(items).flat();
			itemDef = allItems.find((i) => i.id === itemData.id);

			return {
				id: itemData.id,
				count: itemData.count,
				emoji: itemDef ? itemDef.emoji : '📦',
				nameKey: itemDef ? itemDef.nameKey : null,
				type: itemDef ? itemDef.type : 'misc',
			};
		});

		processedInventory.sort((a, b) => {
			if (a.type === b.type) return 0;
			if (a.type === 'equipment') return -1;
			return 1;
		});

		const generatePage = async (page, showButtons = true) => {
			const itemsPerPage = 10;
			const totalPages = Math.ceil(processedInventory.length / itemsPerPage);
			const currentPage = Math.max(1, Math.min(page, totalPages));

			const startIdx = (currentPage - 1) * itemsPerPage;
			const pageItems = processedInventory.slice(
				startIdx,
				startIdx + itemsPerPage,
			);

			let description = '';
			for (const item of pageItems) {
				const name = item.nameKey
					? await t(interaction, item.nameKey)
					: item.id;

				description += `${item.emoji} **${name}** — \`x${item.count}\`\n`;
			}

			const buttons = [];
			if (showButtons && totalPages > 1) {
				buttons.push(
					new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setCustomId('inv_prev')
							.setLabel(await t(interaction, 'common.previous'))
							.setStyle(ButtonStyle.Secondary)
							.setDisabled(currentPage === 1),
						new ButtonBuilder()
							.setCustomId('inv_next')
							.setLabel(await t(interaction, 'common.next'))
							.setStyle(ButtonStyle.Secondary)
							.setDisabled(currentPage === totalPages),
					),
				);
			}

			const containerData = await createContainer(interaction, {
				title: await t(interaction, 'adventure.inventory.title', {
					username: interaction.user.username,
				}),
				description: description,
				color: kythiaConfig.bot.color,
				footer: await t(interaction, 'adventure.inventory.footer', {
					page: currentPage,
					totalPages: totalPages,
					totalItems: processedInventory.length,
				}),
				components: buttons,
			});

			return { components: containerData, totalPages };
		};

		let currentPage = 1;
		const pageData = await generatePage(currentPage);

		const reply = await interaction.editReply({
			components: pageData.components,
			flags: MessageFlags.IsComponentsV2,
			fetchReply: true,
		});

		if (pageData.totalPages <= 1) return;

		const filter = (i) => i.user.id === interaction.user.id;
		const collector = reply.createMessageComponentCollector({
			filter,
			time: 120_000,
		});

		collector.on('collect', async (i) => {
			await i.deferUpdate();

			if (i.customId === 'inv_prev') {
				currentPage--;
			} else if (i.customId === 'inv_next') {
				currentPage++;
			}

			const newPageData = await generatePage(currentPage);
			await interaction.editReply({
				components: newPageData.components,
				flags: MessageFlags.IsComponentsV2,
			});
		});

		collector.on('end', async () => {
			try {
				const finalPage = await generatePage(currentPage, false);

				await interaction.editReply({
					components: finalPage.components,
					flags: MessageFlags.IsComponentsV2,
				});
			} catch (_e) {}
		});
	},
};
