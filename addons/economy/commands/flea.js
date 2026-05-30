/**
 * @namespace: addons/economy/commands/flea.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */
const {
	MessageFlags,
	ActionRowBuilder,
	StringSelectMenuBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require('discord.js');
const { toBigIntSafe } = require('../helpers/bigint');
const { Op } = require('sequelize');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('flea')
			.setDescription('📦 Advanced Player-to-player Grand Auction House.')
			.addStringOption((option) =>
				option
					.setName('action')
					.setDescription('What do you want to do?')
					.setRequired(true)
					.addChoices(
						{ name: 'View Market', value: 'view' },
						{ name: 'List Item', value: 'list' },
						{ name: 'My Listings', value: 'my_listings' },
						{ name: 'Search', value: 'search' },
					),
			)
			.addStringOption((option) =>
				option
					.setName('item')
					.setDescription('Item name to list or search')
					.setRequired(false),
			)
			.addIntegerOption((option) =>
				option
					.setName('price')
					.setDescription('BIN price or Starting Bid (for list)')
					.setRequired(false),
			)
			.addStringOption((option) =>
				option
					.setName('type')
					.setDescription('Listing Type (BIN or Auction)')
					.setRequired(false)
					.addChoices(
						{ name: 'Buy It Now (BIN)', value: 'bin' },
						{ name: 'Auction (24h)', value: 'auction' },
					),
			),

	async execute(interaction, container) {
		const { t, models, kythiaConfig, helpers } = container;
		const { KythiaUser, Inventory, FleaMarketListing } = models;
		const { simpleContainer, createContainer } = helpers.discord;

		await interaction.deferReply();
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

		const action = interaction.options.getString('action');

		if (action === 'list') {
			const itemName = interaction.options.getString('item');
			const price = interaction.options.getInteger('price');
			const type = interaction.options.getString('type') || 'bin';

			if (!itemName || !price) {
				const components = await simpleContainer(
					interaction,
					await t(interaction, 'economy.flea.error.missing_params.desc'),
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			if (price <= 0) {
				const components = await simpleContainer(
					interaction,
					await t(interaction, 'economy.flea.error.invalid_price.desc'),
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			const item = await Inventory.getCache({
				userId: interaction.user.id,
				itemName,
			});
			if (!item) {
				const components = await simpleContainer(
					interaction,
					await t(interaction, 'economy.flea.error.not_owned.desc', {
						item: itemName,
					}),
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			await item.destroy();

			const expiresAt = new Date();
			if (type === 'auction') {
				expiresAt.setHours(expiresAt.getHours() + 24);
			} else {
				expiresAt.setDate(expiresAt.getDate() + 7); // BIN expires in 7 days
			}

			await FleaMarketListing.create({
				sellerId: interaction.user.id,
				itemName,
				price,
				type,
				expiresAt,
				currentBid: type === 'auction' ? price : 0,
			});

			const components = await simpleContainer(
				interaction,
				await t(interaction, 'economy.flea.list.success.desc', {
					item: itemName,
					type: type.toUpperCase(),
					price: price.toLocaleString(),
				}),
				{ color: 'Green' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		if (action === 'view' || action === 'search') {
			const searchTerm = interaction.options.getString('item');
			let currentPage = 1;
			const limit = 10;

			const getListings = async (page) => {
				const whereClause = { expiresAt: { [Op.gt]: new Date() } };
				if (searchTerm && action === 'search') {
					whereClause.itemName = { [Op.iLike]: `%${searchTerm}%` };
				}

				const { count, rows } = await FleaMarketListing.findAndCountAll({
					where: whereClause,
					order: [['createdAt', 'DESC']],
					limit: limit,
					offset: (page - 1) * limit,
				});
				return { count, rows };
			};

			const renderPage = async (page) => {
				const { count, rows: listings } = await getListings(page);
				const totalPages = Math.max(1, Math.ceil(count / limit));

				if (listings.length === 0) {
					return {
						components: await simpleContainer(
							interaction,
							await t(interaction, 'economy.flea.view.empty.desc'),
							{ color: 'Yellow' },
						),
					};
				}

				const options = await Promise.all(
					listings.map(async (listing) => {
						const isAuction = listing.type === 'auction';
						const displayPrice = isAuction ? listing.currentBid : listing.price;
						return {
							label: listing.itemName.substring(0, 50),
							description: await t(
								interaction,
								'economy.flea.view.price_desc',
								{
									type: isAuction ? 'Bid' : 'BIN',
									price: displayPrice.toLocaleString(),
								},
							),
							value: listing.id.toString(),
						};
					}),
				);

				const row = new ActionRowBuilder().addComponents(
					new StringSelectMenuBuilder()
						.setCustomId('interact_flea_item')
						.setPlaceholder(
							await t(interaction, 'economy.flea.view.placeholder'),
						)
						.addOptions(options),
				);

				const navRow = new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId('flea_prev')
						.setLabel('Prev')
						.setStyle(ButtonStyle.Secondary)
						.setDisabled(page <= 1),
					new ButtonBuilder()
						.setCustomId('flea_page')
						.setLabel(`${page}/${totalPages}`)
						.setStyle(ButtonStyle.Secondary)
						.setDisabled(true),
					new ButtonBuilder()
						.setCustomId('flea_next')
						.setLabel('Next')
						.setStyle(ButtonStyle.Secondary)
						.setDisabled(page >= totalPages),
				);

				const viewContainer = await createContainer(interaction, {
					description: await t(interaction, 'economy.flea.view.title'),
					components: [row, navRow],
				});
				return { components: viewContainer, totalPages };
			};

			const { components: currentComponents, totalPages } =
				await renderPage(currentPage);
			const message = await interaction.editReply({
				components: currentComponents,
				flags: MessageFlags.IsComponentsV2,
			});

			const filter = (i) => i.user.id === interaction.user.id;
			const collector = message.createMessageComponentCollector({
				filter,
				time: 120000,
			});

			collector.on('collect', async (i) => {
				if (i.customId === 'flea_prev' && currentPage > 1) {
					currentPage--;
					const res = await renderPage(currentPage);
					await i.update({
						components: res.components,
						flags: MessageFlags.IsComponentsV2,
					});
				} else if (i.customId === 'flea_next' && currentPage < totalPages) {
					currentPage++;
					const res = await renderPage(currentPage);
					await i.update({
						components: res.components,
						flags: MessageFlags.IsComponentsV2,
					});
				} else if (i.customId === 'interact_flea_item') {
					const listingId = i.values[0];
					const listing = await FleaMarketListing.findOne({
						where: { id: listingId },
					});

					if (!listing || new Date() > new Date(listing.expiresAt)) {
						const components = await simpleContainer(
							i,
							await t(i, 'economy.flea.error.unavailable.desc'),
							{ color: 'Red' },
						);
						return i.update({ components, flags: MessageFlags.IsComponentsV2 });
					}

					if (listing.sellerId === interaction.user.id) {
						const components = await simpleContainer(
							i,
							await t(i, 'economy.flea.error.self_buy.desc'),
							{ color: 'Red' },
						);
						return i.update({ components, flags: MessageFlags.IsComponentsV2 });
					}

					if (listing.type === 'bin') {
						user.kythiaCoin =
							typeof user.kythiaCoin === 'bigint'
								? Number(user.kythiaCoin)
								: parseInt(user.kythiaCoin, 10);
						if (user.kythiaCoin < listing.price) {
							const components = await simpleContainer(
								i,
								await t(i, 'economy.flea.buy.error.funds.desc'),
								{ color: 'Red' },
							);
							return i.update({
								components,
								flags: MessageFlags.IsComponentsV2,
							});
						}

						user.kythiaCoin = toBigIntSafe(
							user.kythiaCoin - Number(listing.price),
						);
						user.changed('kythiaCoin', true);
						await user.save();

						await Inventory.create({
							userId: interaction.user.id,
							itemName: listing.itemName,
						});

						const seller = await KythiaUser.getCache({
							userId: listing.sellerId,
						});
						if (seller) {
							const profit = Math.floor(listing.price * 0.9);
							seller.kythiaCoin =
								toBigIntSafe(seller.kythiaCoin) + toBigIntSafe(profit);
							seller.changed('kythiaCoin', true);
							await seller.save();
						}
						await listing.destroy();

						const components = await simpleContainer(
							i,
							await t(i, 'economy.flea.buy.success.desc', {
								item: listing.itemName,
								price: listing.price.toLocaleString(),
							}),
							{ color: 'Green' },
						);
						await i.update({ components, flags: MessageFlags.IsComponentsV2 });
					} else {
						// Auction logic
						const minBid = Math.floor(listing.currentBid * 1.05); // Minimum 5% increase

						const bidRow = new ActionRowBuilder().addComponents(
							new ButtonBuilder()
								.setCustomId(`confirm_bid_${listing.id}`)
								.setLabel(`Bid 🪙 ${minBid.toLocaleString()}`)
								.setStyle(ButtonStyle.Success),
							new ButtonBuilder()
								.setCustomId('cancel_bid')
								.setLabel('Cancel')
								.setStyle(ButtonStyle.Danger),
						);

						const components = await createContainer(i, {
							description: await t(i, 'economy.flea.buy.auction_desc', {
								item: listing.itemName,
								currentBid: listing.currentBid.toLocaleString(),
								timeLeft: Math.floor(
									new Date(listing.expiresAt).getTime() / 1000,
								),
								minBid: minBid.toLocaleString(),
							}),
							components: [bidRow],
						});
						await i.update({ components, flags: MessageFlags.IsComponentsV2 });
					}
				} else if (i.customId.startsWith('confirm_bid_')) {
					const listingId = i.customId.split('_')[2];
					const listing = await FleaMarketListing.findOne({
						where: { id: listingId },
					});

					if (!listing || new Date() > new Date(listing.expiresAt)) {
						const components = await simpleContainer(
							i,
							await t(i, 'economy.flea.bid.error.ended.desc'),
							{ color: 'Red' },
						);
						return i.update({ components, flags: MessageFlags.IsComponentsV2 });
					}

					const minBid = Math.floor(listing.currentBid * 1.05);
					user.kythiaCoin =
						typeof user.kythiaCoin === 'bigint'
							? Number(user.kythiaCoin)
							: parseInt(user.kythiaCoin, 10);

					if (user.kythiaCoin < minBid) {
						const components = await simpleContainer(
							i,
							await t(i, 'economy.flea.bid.error.funds.desc'),
							{ color: 'Red' },
						);
						return i.update({ components, flags: MessageFlags.IsComponentsV2 });
					}

					// Refund previous highest bidder
					if (listing.highestBidderId) {
						const prevBidder = await KythiaUser.getCache({
							userId: listing.highestBidderId,
						});
						if (prevBidder) {
							prevBidder.kythiaCoin =
								toBigIntSafe(prevBidder.kythiaCoin) +
								toBigIntSafe(listing.currentBid);
							prevBidder.changed('kythiaCoin', true);
							await prevBidder.save();
						}
					}

					// Take new bid
					user.kythiaCoin = toBigIntSafe(user.kythiaCoin - minBid);
					user.changed('kythiaCoin', true);
					await user.save();

					listing.currentBid = minBid;
					listing.highestBidderId = interaction.user.id;
					await listing.save();

					const components = await simpleContainer(
						i,
						await t(i, 'economy.flea.bid.success.desc', {
							bid: minBid.toLocaleString(),
							item: listing.itemName,
						}),
						{ color: 'Green' },
					);
					await i.update({ components, flags: MessageFlags.IsComponentsV2 });
				} else if (i.customId === 'cancel_bid') {
					const res = await renderPage(currentPage);
					await i.update({
						components: res.components,
						flags: MessageFlags.IsComponentsV2,
					});
				}
			});
			return;
		}

		if (action === 'my_listings') {
			const listings = await FleaMarketListing.findAll({
				where: { sellerId: interaction.user.id },
				order: [['createdAt', 'DESC']],
			});

			if (listings.length === 0) {
				const components = await simpleContainer(
					interaction,
					await t(interaction, 'economy.flea.manage.empty.desc'),
					{ color: 'Yellow' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			const options = listings.slice(0, 25).map((listing) => ({
				label: listing.itemName,
				description: `${listing.type === 'auction' ? 'Bid' : 'BIN'}: 🪙 ${(listing.type === 'auction' ? listing.currentBid : listing.price).toLocaleString()} - Click to cancel`,
				value: listing.id.toString(),
			}));

			const row = new ActionRowBuilder().addComponents(
				new StringSelectMenuBuilder()
					.setCustomId('cancel_listing')
					.setPlaceholder(
						await t(interaction, 'economy.flea.manage.placeholder'),
					)
					.addOptions(options),
			);

			const myContainer = await createContainer(interaction, {
				description: await t(interaction, 'economy.flea.manage.title'),
				components: [row],
			});

			const message = await interaction.editReply({
				components: myContainer,
				flags: MessageFlags.IsComponentsV2,
			});

			const filter = (i) => i.user.id === interaction.user.id;
			const collector = message.createMessageComponentCollector({
				filter,
				time: 60000,
			});

			collector.on('collect', async (i) => {
				if (i.customId === 'cancel_listing') {
					const listingId = i.values[0];
					const listing = await FleaMarketListing.findOne({
						where: { id: listingId, sellerId: interaction.user.id },
					});

					if (!listing) {
						const components = await simpleContainer(
							i,
							await t(i, 'economy.flea.manage.error.not_found.desc'),
							{
								color: 'Red',
							},
						);
						return i.update({ components, flags: MessageFlags.IsComponentsV2 });
					}

					if (listing.type === 'auction' && listing.highestBidderId) {
						const components = await simpleContainer(
							i,
							await t(i, 'economy.flea.manage.error.has_bids.desc'),
							{ color: 'Red' },
						);
						return i.update({ components, flags: MessageFlags.IsComponentsV2 });
					}

					await Inventory.create({
						userId: interaction.user.id,
						itemName: listing.itemName,
					});
					await listing.destroy();

					const components = await simpleContainer(
						i,
						await t(i, 'economy.flea.manage.cancel_success.desc', {
							item: listing.itemName,
						}),
						{ color: 'Green' },
					);
					await i.update({ components, flags: MessageFlags.IsComponentsV2 });
				}
			});
		}
	},
};
