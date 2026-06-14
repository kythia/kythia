/**
 * @namespace: addons/economy/commands/crime/blackmarket.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
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
const { getSpotPrice } = require('../../helpers/kyth-amm');

const { BaseCommand } = require('kythia-core');

const { ITEMS_PER_PAGE } = require('../../helpers/constants');

class BlackmarketCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('blackmarket')
			.setDescription('🕶️ The underground Black Market. Accepts KYTH only.');

	async execute(interaction) {
		const container = this.container;
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
				await t(interaction, 'economy.crime.blackmarket.error.closed.desc'),
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

		const renderPage = async (page) => {
			const start = (page - 1) * ITEMS_PER_PAGE;
			const pageItems = BLACKMARKET_ITEMS.slice(start, start + ITEMS_PER_PAGE);

			const totalPages = Math.ceil(BLACKMARKET_ITEMS.length / ITEMS_PER_PAGE);

			let itemText = '';
			for (const item of pageItems) {
				const eqStr =
					item.priceKyth > 0 && spotPrice > 0
						? `(≈ 🪙 ${(item.priceKyth * spotPrice).toLocaleString()})`
						: '';
				itemText += `${item.emoji} **${item.name}**\n*${item.description}*\n💰 **Price:** ${item.priceKyth} KYTH ${eqStr}\n\n`;
			}

			const selectOptions = pageItems.map((item) => ({
				label: item.name,
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
						await t(interaction, 'economy.crime.blackmarket.title.desc', {
							balance: userKyth.toFixed(4),
							page,
							total: totalPages,
						}),
					),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						itemText.trim() ||
							(await t(interaction, 'economy.crime.blackmarket.empty.desc')),
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

		const { container: shopContainer } = await renderPage(currentPage);
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
						await t(i, 'economy.crime.blackmarket.error.no_item.desc'),
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
						await t(i, 'economy.crime.blackmarket.error.out_of_stock.desc', {
							item: `${item.emoji} ${item.name}`,
						}),
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
						await t(
							i,
							'economy.crime.blackmarket.error.insufficient_kyth.desc',
							{ price: item.priceKyth, balance: freshKyth.toFixed(4) },
						),
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
					await t(i, 'economy.crime.blackmarket.success.desc', {
						item: `${item.emoji} ${item.name}`,
						price: item.priceKyth,
					}),
					{ color: 'Green' },
				);
				await i.update({
					components: comps,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		});
	}
}

exports.default = BlackmarketCommand;
