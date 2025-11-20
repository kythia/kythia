/**
 * @namespace: addons/economy/commands/market/buy.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder } = require('discord.js');
const { getMarketData, ASSET_IDS } = require('../../helpers/market');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('buy')
            .setDescription('💸 Buy an asset from the global market.')
            .addStringOption((option) =>
                option
                    .setName('asset')
                    .setDescription('The symbol of the asset you want to buy (e.g., BTC, ETH)')
                    .setRequired(true)
                    .addChoices(...ASSET_IDS.map((id) => ({ name: id.toUpperCase(), value: id })))
            )
            .addNumberOption((option) =>
                option.setName('amount').setDescription('The amount of KythiaCoin you want to spend').setRequired(true).setMinValue(1)
            ),

    async execute(interaction, container) {
        const { t, models, kythiaConfig, helpers } = container;
        const { KythiaUser, MarketPortfolio, MarketTransaction } = models;
        const { embedFooter } = helpers.discord;

        await interaction.deferReply();

        const assetId = interaction.options.getString('asset');
        const amountToSpend = interaction.options.getNumber('amount');

        let user = await KythiaUser.getCache({ userId: interaction.user.id });
        if (!user) {
            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setDescription(await t(interaction, 'economy.withdraw.no.account.desc'))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        if (user.kythiaCoin < amountToSpend) {
            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setDescription(
                    `## ${await t(interaction, 'economy.market.buy.insufficient.funds.title')}\n${await t(interaction, 'economy.market.buy.insufficient.funds.desc', { amount: amountToSpend.toLocaleString() })}`
                )
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const marketData = await getMarketData();
        const assetData = marketData[assetId];

        if (!assetData) {
            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setDescription(
                    `## ${await t(interaction, 'economy.market.buy.asset.not.found.title')}\n${await t(interaction, 'economy.market.buy.asset.not.found.desc')}`
                )
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const currentPrice = assetData.usd;
        const quantityToBuy = amountToSpend / currentPrice;

        try {
            const existingHolding = await MarketPortfolio.getCache({
                userId: interaction.user.id,
                assetId: assetId,
            });

            if (existingHolding) {
                const oldQuantity = existingHolding.quantity;
                const oldAvgPrice = existingHolding.avgBuyPrice;

                const newTotalQuantity = oldQuantity + quantityToBuy;
                const newAvgBuyPrice = (oldQuantity * oldAvgPrice + quantityToBuy * currentPrice) / newTotalQuantity;

                existingHolding.quantity = newTotalQuantity;
                existingHolding.avgBuyPrice = newAvgBuyPrice;
                await existingHolding.save();
            } else {
                await MarketPortfolio.create({
                    userId: interaction.user.id,
                    assetId: assetId,
                    quantity: quantityToBuy,
                    avgBuyPrice: currentPrice,
                });
            }

            await MarketTransaction.create({
                userId: interaction.user.id,
                assetId: assetId,
                type: 'buy',
                quantity: quantityToBuy,
                price: currentPrice,
            });

            user.kythiaCoin = BigInt(user.kythiaCoin) - BigInt(amountToSpend);

            user.changed('kythiaCoin', true);

            await user.saveAndUpdateCache();

            const successEmbed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(
                    `## ${await t(interaction, 'economy.market.buy.success.title')}\n${await t(interaction, 'economy.market.buy.success.desc', { quantity: quantityToBuy.toFixed(6), asset: assetId.toUpperCase(), amount: amountToSpend.toLocaleString() })}`
                )
                .setFooter(await embedFooter(interaction));

            await interaction.editReply({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error during market buy:', error);
            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setDescription(
                    `## ${await t(interaction, 'economy.market.buy.error.title')}\n${await t(interaction, 'economy.market.buy.error.desc')}`
                )
                .setFooter(await embedFooter(interaction));
            await interaction.editReply({ embeds: [embed] });
        }
    },
};
