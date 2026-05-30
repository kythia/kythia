/**
 * @namespace: addons/economy/tasks/flea-processor.js
 * @type: Scheduled Task
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Op } = require('sequelize');
const { toBigIntSafe } = require('../helpers/bigint');

module.exports = {
	taskName: 'economy-flea-processor',
	schedule: '*/5 * * * *',
	active: true,

	execute: async (container) => {
		const { client, models, logger } = container;
		const { FleaMarketListing, Inventory, KythiaUser } = models;

		if (client.shard && !client.shard.ids.includes(0)) {
			return;
		}

		logger.info(`Processing expired Flea Market listings...`, {
			label: 'economy',
		});

		try {
			const expiredListings = await FleaMarketListing.findAll({
				where: {
					expiresAt: {
						[Op.lte]: new Date(),
					},
				},
			});

			for (const listing of expiredListings) {
				if (listing.type === 'auction' && listing.highestBidderId) {
					const seller = await KythiaUser.getCache({
						userId: listing.sellerId,
					});
					const profit = Math.floor(listing.currentBid * 0.9);

					if (seller) {
						seller.kythiaCoin =
							toBigIntSafe(seller.kythiaCoin) + toBigIntSafe(profit);
						seller.changed('kythiaCoin', true);
						await seller.save();

						try {
							const sellerDiscord = await client.users.fetch(listing.sellerId);
							await sellerDiscord.send(
								`## 📦 Auction Ended!\nYour auction for **${listing.itemName}** has ended!\nAfter the 10% market tax, you received **🪙 ${profit.toLocaleString()}**.`,
							);
						} catch (_e) {}
					}

					await Inventory.create({
						userId: listing.highestBidderId,
						itemName: listing.itemName,
					});

					try {
						const winnerDiscord = await client.users.fetch(
							listing.highestBidderId,
						);
						await winnerDiscord.send(
							`## 🔨 Auction Won!\nYou won the auction for **${listing.itemName}** with a bid of **🪙 ${listing.currentBid.toLocaleString()}**! The item is now in your inventory.`,
						);
					} catch (_e) {}
				} else {
					await Inventory.create({
						userId: listing.sellerId,
						itemName: listing.itemName,
					});

					try {
						const sellerDiscord = await client.users.fetch(listing.sellerId);
						await sellerDiscord.send(
							`## 📦 Listing Expired\nYour listing for **${listing.itemName}** expired without selling. The item has been returned to your inventory.`,
						);
					} catch (_e) {}
				}

				await listing.destroy();
			}
		} catch (error) {
			logger.error(`Error processing flea market: ${error.message || error}`, {
				label: 'economy',
			});
		}
	},
};
