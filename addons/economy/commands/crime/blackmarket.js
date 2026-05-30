/**
 * @namespace: addons/economy/commands/blackmarket.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const {
	MessageFlags,
	ActionRowBuilder,
	StringSelectMenuBuilder,
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
const {
	BLACKMARKET_ITEMS,
	getItem,
} = require('../../helpers/blackmarket-items');
const { toBigIntSafe } = require('../../helpers/bigint');
const { getSpotPrice } = require('../../helpers/kyth-amm');

const ITEMS_PER_PAGE = 5;

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('blackmarket')
			.setDescription('🕶️ The underground Black Market. Accepts KYTH only.'),

	async execute(interaction, container) {
		const { t, models, kythiaConfig, helpers } = container;
		const { KythiaUser, KythLiquidityPool, Inventory } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const user = await KythiaUser.getCache({ userId: interaction.user.id });
		if (!user) {
			const msg = await t(interaction, 'economy.withdraw.no.account.desc');
			const components = await simpleContainer(interaction, msg, {
				color: kythiaConfig.bot.color,
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const pool = await KythLiquidityPool.getCache({ id: 1 }, { noCache: true });

		// ── Admin: Black Market kill switch ────────────────────────────────
		if (pool && pool.blackmarketActive === false) {
			const components = await simpleContainer(
				interaction,
				'## 🔒 Black Market Closed\nThe Black Market is currently closed by admin. Check back later.',
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const spotPrice = pool
			? getSpotPrice({
					coinReserve: Number(pool.coinReserve),
					kythReserve: Number(pool.kythReserve),
				})
			: 0;
		const userKyth = Number(user.kythHolding) || 0;

		const currentPage = 1;

		const renderPage = (page) => {
			const start = (page - 1) * ITEMS_PER_PAGE;
			const pageItems = BLACKMARKET_ITEMS.slice(start, start + ITEMS_PER_PAGE);
			const totalPages = Math.max(
				1,
				Math.ceil(BLACKMARKET_ITEMS.length / ITEMS_PER_PAGE),
			);

			let itemText = '';
			for (const item of pageItems) {
				const stockText = item.stock !== null ? ` (Stock: ${item.stock})` : '';
				const coinEquiv = (item.priceKyth * spotPrice).toLocaleString(
					undefined,
					{ maximumFractionDigits: 0 },
				);
				itemText += `**${item.emoji} ${item.name}**${stockText}\n*${item.description}*\n💎 **${item.priceKyth} KYTH** ≈ 🪙 ${coinEquiv} Coin\n\n`;
			}

			const selectOptions = pageItems.map((item) => ({
				label: `${item.name} (${item.priceKyth} KYTH)`,
				value: item.id,
				emoji: item.emoji,
				description: item.description.substring(0, 100),
			}));

			const selectRow = new ActionRowBuilder().addComponents(
				new StringSelectMenuBuilder()
					.setCustomId('bm_buy_item')
					.setPlaceholder('Select an item to purchase...')
					.addOptions(selectOptions)
					.setDisabled(pageItems.length === 0),
			);

			const container = new ContainerBuilder()
				.setAccentColor(0x1a1a2e)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`## 🕶️ The Black Market\nWelcome, stranger. KYTH only. No refunds.\n\n💎 **Your KYTH Balance:** ${userKyth.toFixed(4)}\n📄 Page ${page}/${totalPages}`,
					),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						itemText.trim() || 'No items available.',
					),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addActionRowComponents(selectRow);

			return { container, pageItems, totalPages };
		};

		const { container: shopContainer, totalPages } = renderPage(currentPage);
		const message = await interaction.editReply({
			components: [shopContainer],
			flags: MessageFlags.IsComponentsV2,
		});

		const filter = (i) => i.user.id === interaction.user.id;
		const collector = message.createMessageComponentCollector({
			filter,
			time: 120000,
		});

		collector.on('collect', async (i) => {
			if (i.customId === 'bm_buy_item') {
				const itemId = i.values[0];
				const item = getItem(itemId);

				if (!item) {
					const comps = await simpleContainer(
						i,
						'This item no longer exists.',
						{ color: 'Red' },
					);
					return i.update({
						components: comps,
						flags: MessageFlags.IsComponentsV2,
					});
				}

				if (item.stock !== null && item.stock <= 0) {
					const comps = await simpleContainer(
						i,
						`## ❌ Out of Stock\n**${item.emoji} ${item.name}** is sold out.`,
						{ color: 'Red' },
					);
					return i.update({
						components: comps,
						flags: MessageFlags.IsComponentsV2,
					});
				}

				const freshUser = await KythiaUser.getCache(
					{ userId: interaction.user.id },
					{ noCache: true },
				);
				const freshKyth = Number(freshUser.kythHolding) || 0;

				if (freshKyth < item.priceKyth) {
					const comps = await simpleContainer(
						i,
						`## ❌ Insufficient KYTH\nYou need **${item.priceKyth} KYTH** but only have **${freshKyth.toFixed(4)} KYTH**.`,
						{ color: 'Red' },
					);
					return i.update({
						components: comps,
						flags: MessageFlags.IsComponentsV2,
					});
				}

				// Deduct KYTH
				freshUser.kythHolding = Math.max(0, freshKyth - item.priceKyth);
				freshUser.changed('kythHolding', true);
				await freshUser.save();

				// Give item to user via Inventory
				await Inventory.create({
					userId: interaction.user.id,
					itemName: `${item.emoji} ${item.name}`,
				});

				// Reduce stock if limited
				if (item.stock !== null) {
					item.stock = Math.max(0, item.stock - 1);
				}

				const comps = await simpleContainer(
					i,
					`## 🕶️ Purchase Complete!\nYou bought **${item.emoji} ${item.name}** for **${item.priceKyth} KYTH**.\nThe item has been added to your inventory. Use it wisely.`,
					{ color: 'Green' },
				);
				await i.update({
					components: comps,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		});
	},
};
