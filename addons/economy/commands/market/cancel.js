/**
 * @namespace: addons/economy/commands/market/cancel.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags } = require('discord.js');
const { toBigIntSafe } = require('../../helpers/bigint');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('cancel')
			.setDescription('Cancel an open order.')
			.addStringOption((option) =>
				option
					.setName('order_id')
					.setDescription('The ID of the order to cancel')
					.setRequired(true),
			),

	async execute(interaction, container) {
		const { t, models, helpers, logger } = container;
		const { KythiaUser, MarketPortfolio, MarketOrder } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();
		const orderId = interaction.options.getString('order_id');

		try {
			const order = await MarketOrder.getCache({
				id: orderId,
				userId: interaction.user.id,
				status: 'open',
			});

			if (!order) {
				const msg = await t(
					interaction,
					'economy.market.cancel.not.found.desc',
				);
				const components = await simpleContainer(interaction, msg, {
					color: 'Red',
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			if (order.side === 'buy') {
				const user = await KythiaUser.getCache({ userId: interaction.user.id });
				const totalCost = order.quantity * order.price;

				user.kythiaCoin =
					toBigIntSafe(user.kythiaCoin) + toBigIntSafe(totalCost);

				user.changed('kythiaCoin', true);

				await user.save();
			} else {
				const portfolio = await MarketPortfolio.getCache({
					userId: interaction.user.id,
					assetId: order.assetId,
				});
				if (portfolio) {
					portfolio.quantity += order.quantity;
					await portfolio.save();
				} else {
					await MarketPortfolio.create({
						userId: interaction.user.id,
						assetId: order.assetId,
						quantity: order.quantity,
						avgBuyPrice: 0,
					});
				}
			}

			order.status = 'cancelled';
			await order.save();

			const msg = await t(interaction, 'economy.market.cancel.success.desc', {
				orderId: order.id,
			});
			const components = await simpleContainer(interaction, msg, {
				color: 'Green',
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			logger.error(`Error in cancel order: ${error.message || error}`, {
				label: 'core:commands:economy:market:cancel',
			});
			const msg = await t(interaction, 'economy.market.cancel.error.desc');
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	},
};
