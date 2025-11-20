/**
 * @namespace: addons/economy/commands/market/limit.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder } = require('discord.js');
const { ASSET_IDS } = require('../../helpers/market');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('limit')
            .setDescription('Set a limit order to buy or sell an asset at a specific price.')
            .addStringOption((option) =>
                option
                    .setName('side')
                    .setDescription('Whether to buy or sell the asset')
                    .setRequired(true)
                    .addChoices({ name: 'Buy', value: 'buy' }, { name: 'Sell', value: 'sell' })
            )
            .addStringOption((option) =>
                option
                    .setName('asset')
                    .setDescription('The symbol of the asset')
                    .setRequired(true)
                    .addChoices(...ASSET_IDS.map((id) => ({ name: id.toUpperCase(), value: id })))
            )
            .addNumberOption((option) =>
                option.setName('quantity').setDescription('The amount of the asset to buy or sell').setRequired(true).setMinValue(0.000001)
            )
            .addNumberOption((option) =>
                option.setName('price').setDescription('The price at which to place the order').setRequired(true).setMinValue(0.01)
            ),

    async execute(interaction, container) {
        const { t, models, kythiaConfig, helpers } = container;
        const { KythiaUser, MarketPortfolio, MarketOrder } = models;
        const { embedFooter } = helpers.discord;

        await interaction.deferReply();

        const side = interaction.options.getString('side');
        const assetId = interaction.options.getString('asset');
        const quantity = interaction.options.getNumber('quantity');
        const price = interaction.options.getNumber('price');

        let user = await KythiaUser.getCache({ userId: interaction.user.id });
        if (!user) {
            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setDescription(await t(interaction, 'economy.withdraw.no.account.desc'))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        try {
            if (side === 'buy') {
                const totalCost = quantity * price;
                if (user.kythiaCoin < totalCost) {
                    const embed = new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(
                            `## ${await t(interaction, 'economy.market.buy.insufficient.funds.title')}\n${await t(interaction, 'economy.market.buy.insufficient.funds.desc', { amount: totalCost.toLocaleString() })}`
                        )
                        .setThumbnail(interaction.user.displayAvatarURL())
                        .setFooter(await embedFooter(interaction));
                    return interaction.editReply({ embeds: [embed] });
                }

                const order = await MarketOrder.create({
                    userId: interaction.user.id,
                    assetId,
                    type: 'limit',
                    side: 'buy',
                    quantity,
                    price,
                });

                user.kythiaCoin = BigInt(user.kythiaCoin) - BigInt(totalCost);

                user.changed('kythiaCoin', true);

                await user.saveAndUpdateCache();

                const successEmbed = new EmbedBuilder()
                    .setColor('Green')
                    .setDescription(
                        `## ${await t(interaction, 'economy.market.limit.buy.success.title')}\n${await t(interaction, 'economy.market.limit.buy.success.desc', { quantity: quantity, asset: assetId.toUpperCase(), price: price.toLocaleString() })}\n\nOrder ID: \`${order.id}\``
                    )
                    .setFooter(await embedFooter(interaction));
                return interaction.editReply({ embeds: [successEmbed] });
            } else {
                const holding = await MarketPortfolio.getCache({
                    userId: interaction.user.id,
                    assetId: assetId,
                });

                if (!holding || holding.quantity < quantity) {
                    const embed = new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(
                            `## ${await t(interaction, 'economy.market.sell.insufficient.asset.title')}\n${await t(interaction, 'economy.market.sell.insufficient.asset.desc', { asset: assetId.toUpperCase() })}`
                        )
                        .setThumbnail(interaction.user.displayAvatarURL())
                        .setFooter(await embedFooter(interaction));
                    return interaction.editReply({ embeds: [embed] });
                }

                const order = await MarketOrder.create({
                    userId: interaction.user.id,
                    assetId,
                    type: 'limit',
                    side: 'sell',
                    quantity,
                    price,
                });

                holding.quantity -= quantity;
                if (holding.quantity > 0) {
                    await holding.save();
                } else {
                    await holding.destroy();
                }

                const successEmbed = new EmbedBuilder()
                    .setColor('Yellow')
                    .setDescription(
                        `## ${await t(interaction, 'economy.market.limit.sell.success.title')}\n${await t(interaction, 'economy.market.limit.sell.success.desc', { quantity: quantity, asset: assetId.toUpperCase(), price: price.toLocaleString() })}\n\nOrder ID: \`${order.id}\``
                    )
                    .setFooter(await embedFooter(interaction));
                return interaction.editReply({ embeds: [successEmbed] });
            }
        } catch (error) {
            console.error('Error in limit order:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(
                    `## ${await t(interaction, 'economy.market.order.error.title')}\n${await t(interaction, 'economy.market.order.error.desc')}`
                );
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};
