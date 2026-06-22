/**
 * @namespace: addons/economy/tasks/flea-processor.js
 * @type: Scheduled Task
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Op } = require('sequelize');
const { toBigIntSafe } = require('../helpers/bigint');
const { BaseTask } = require('kythia-core');
class FleaProcessorTask extends BaseTask {
	task = {
		taskName: 'economy-flea-processor',
		schedule: '*/5 * * * *',
		active: true,
	};
	async execute(container) {
		const { client, models, logger, t } = container || this.container;
		const { FleaMarketListing, Inventory, KythiaUser } = models;
		if (client.shard && !client.shard.ids.includes(0)) {
			return;
		}
		logger.info(`Processing expired Flea Market listings...`, {
			label: 'economy',
		});
		try {
			const expiredListings = await FleaMarketListing.getAllCache({
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
							const sellerDiscord =
								await client.container.helpers.discord.getUserSafe(
									client,
									listing.sellerId,
								);
							await sellerDiscord.send(
								await t(
									null,
									'economy.tasks.flea-processor.flea.auction_ended',
									{
										itemName: listing.itemName,
										profit: profit.toLocaleString(),
									},
								),
							);
						} catch (_e) {}
					}
					await Inventory.create({
						userId: listing.highestBidderId,
						itemName: listing.itemName,
					});
					try {
						const winnerDiscord =
							await client.container.helpers.discord.getUserSafe(
								client,
								listing.highestBidderId,
							);
						await winnerDiscord.send(
							await t(null, 'economy.tasks.flea-processor.flea.auction_won', {
								itemName: listing.itemName,
								bid: listing.currentBid.toLocaleString(),
							}),
						);
					} catch (_e) {}
				} else {
					await Inventory.create({
						userId: listing.sellerId,
						itemName: listing.itemName,
					});
					try {
						const sellerDiscord =
							await client.container.helpers.discord.getUserSafe(
								client,
								listing.sellerId,
							);
						await sellerDiscord.send(
							await t(
								null,
								'economy.tasks.flea-processor.flea.listing_expired',
								{
									itemName: listing.itemName,
								},
							),
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
	}
}
exports.default = FleaProcessorTask;
