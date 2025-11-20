/**
 * @namespace: addons/economy/commands/market/cancel.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder } = require('discord.js');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('cancel')
            .setDescription('Cancel an open order.')
            .addStringOption((option) => option.setName('order_id').setDescription('The ID of the order to cancel').setRequired(true)),

    async execute(interaction, container) {
        const { t, models, kythiaConfig, helpers } = container;
        const { KythiaUser, MarketPortfolio, MarketOrder } = models;
        const { embedFooter } = helpers.discord;

        await interaction.deferReply();
        const orderId = interaction.options.getString('order_id');

        try {
            const order = await MarketOrder.getCache({ id: orderId, userId: interaction.user.id, status: 'open' });

            if (!order) {
                const notFoundEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(
                        `## ${await t(interaction, 'economy.market.cancel.not.found.title')}\n${await t(interaction, 'economy.market.cancel.not.found.desc')}`
                    );
                return interaction.editReply({ embeds: [notFoundEmbed] });
            }

            if (order.side === 'buy') {
                const user = await KythiaUser.getCache({ userId: interaction.user.id });
                const totalCost = order.quantity * order.price;

                user.kythiaCoin = BigInt(user.kythiaCoin) + BigInt(totalCost);

                user.changed('kythiaCoin', true);

                await user.saveAndUpdateCache();
            } else {
                const portfolio = await MarketPortfolio.getCache({ userId: interaction.user.id, assetId: order.assetId });
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

            const successEmbed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(
                    `## ${await t(interaction, 'economy.market.cancel.success.title')}\n${await t(interaction, 'economy.market.cancel.success.desc', { orderId: order.id })}`
                );
            await interaction.editReply({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error in cancel order:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(
                    `## ${await t(interaction, 'economy.market.cancel.error.title')}\n${await t(interaction, 'economy.market.cancel.error.desc')}`
                );
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};
