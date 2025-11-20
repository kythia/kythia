/**
 * @namespace: addons/economy/commands/market/stoploss.js
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
            .setName('stoploss')
            .setDescription('Set a stop-loss order to sell an asset if it reaches a certain price.')
            .addStringOption((option) =>
                option
                    .setName('asset')
                    .setDescription('The symbol of the asset')
                    .setRequired(true)
                    .addChoices(...ASSET_IDS.map((id) => ({ name: id.toUpperCase(), value: id })))
            )
            .addNumberOption((option) =>
                option.setName('quantity').setDescription('The amount of the asset to sell').setRequired(true).setMinValue(0.000001)
            )
            .addNumberOption((option) =>
                option.setName('price').setDescription('The price at which to trigger the sell order').setRequired(true).setMinValue(0.01)
            ),

    async execute(interaction, container) {
        const { t, models, kythiaConfig, helpers } = container;
        const { KythiaUser, MarketPortfolio, MarketOrder } = models;
        const { embedFooter } = helpers.discord;

        await interaction.deferReply();

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
                type: 'stoploss',
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
                    `## ${await t(interaction, 'economy.market.stoploss.sell.success.title')}\n${await t(interaction, 'economy.market.stoploss.sell.success.desc', { quantity: quantity, asset: assetId.toUpperCase(), price: price.toLocaleString() })}\n\nOrder ID: \`${order.id}\``
                )
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error in stop-loss order:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(
                    `## ${await t(interaction, 'economy.market.order.error.title')}\n${await t(interaction, 'economy.market.order.error.desc')}`
                );
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};
