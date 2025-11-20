/**
 * @namespace: addons/economy/commands/market/sell.js
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
            .setName('sell')
            .setDescription('💰 Sell an asset to the global market.')
            .addStringOption((option) =>
                option
                    .setName('asset')
                    .setDescription('The symbol of the asset you want to sell (e.g., BTC, ETH)')
                    .setRequired(true)
                    .addChoices(...ASSET_IDS.map((id) => ({ name: id.toUpperCase(), value: id })))
            )
            .addNumberOption((option) =>
                option
                    .setName('quantity')
                    .setDescription('The amount of the asset you want to sell (e.g., 0.5)')
                    .setRequired(true)
                    .setMinValue(0.000001)
            ),

    async execute(interaction, container) {
        const { t, models, kythiaConfig, helpers } = container;
        const { KythiaUser, MarketPortfolio, MarketTransaction } = models;
        const { embedFooter } = helpers.discord;

        await interaction.deferReply();

        const assetId = interaction.options.getString('asset');
        const sellQuantity = interaction.options.getNumber('quantity');

        let user = await KythiaUser.getCache({ userId: interaction.user.id });
        if (!user) {
            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setDescription(await t(interaction, 'economy.withdraw.no.account.desc'))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const holding = await MarketPortfolio.getCache({
            userId: interaction.user.id,
            assetId: assetId,
        });

        if (!holding || holding.quantity < sellQuantity) {
            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setDescription(
                    `## ${await t(interaction, 'economy.market.sell.insufficient.asset.title')}\n${await t(interaction, 'economy.market.sell.insufficient.asset.desc', { asset: assetId.toUpperCase() })}`
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
                    `## ${await t(interaction, 'economy.market.sell.asset.not.found.title')}\n${await t(interaction, 'economy.market.sell.asset.not.found.desc')}`
                )
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const currentPrice = assetData.usd;
        const totalUsdReceived = sellQuantity * currentPrice;

        try {
            const newQuantity = holding.quantity - sellQuantity;
            if (newQuantity > 0) {
                holding.quantity = newQuantity;
                await holding.save();
            } else {
                await holding.destroy();
            }

            await MarketTransaction.create({
                userId: interaction.user.id,
                assetId: assetId,
                type: 'sell',
                quantity: sellQuantity,
                price: currentPrice,
            });

            // Fix: Don't use BigInt if value is not integer. Use Number for fractional currency.
            // If kythiaCoin is BigInt in DB, convert to float field, otherwise this logic works for decimal field too.
            // If user.kythiaCoin is a string with only integer, parseInt, otherwise use parseFloat.
            // We'll treat kythiaCoin as decimal (float) value here.
            // Defensive: If it's integer string, parseInt, else parseFloat.
            let kythiaCoinNumeric =
                typeof user.kythiaCoin === 'bigint'
                    ? Number(user.kythiaCoin)
                    : typeof user.kythiaCoin === 'number'
                      ? user.kythiaCoin
                      : /^\d+$/.test(user.kythiaCoin)
                        ? parseInt(user.kythiaCoin, 10)
                        : parseFloat(user.kythiaCoin);

            kythiaCoinNumeric += totalUsdReceived;

            user.kythiaCoin = kythiaCoinNumeric;

            user.changed('kythiaCoin', true);

            await user.saveAndUpdateCache();

            const pnl = (currentPrice - holding.avgBuyPrice) * sellQuantity;
            const pnlSign = pnl >= 0 ? '+' : '';
            const pnlEmoji = pnl >= 0 ? '📈' : '📉';

            const successEmbed = new EmbedBuilder()
                .setColor('Yellow')
                .setDescription(
                    `## ${await t(interaction, 'economy.market.sell.success.title')}\n${await t(interaction, 'economy.market.sell.success.desc', { quantity: sellQuantity.toFixed(6), asset: assetId.toUpperCase(), amount: totalUsdReceived.toLocaleString(undefined, { maximumFractionDigits: 2 }), avgBuyPrice: holding.avgBuyPrice.toLocaleString(undefined, { maximumFractionDigits: 2 }), sellPrice: currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 }), pnlEmoji: pnlEmoji, pnlSign: pnlSign, pnl: pnl.toLocaleString(undefined, { maximumFractionDigits: 2 }) })}`
                )
                .setFooter(await embedFooter(interaction));

            await interaction.editReply({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error during market sell:', error);
            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setDescription(
                    `## ${await t(interaction, 'economy.market.sell.error.title')}\n${await t(interaction, 'economy.market.sell.error.desc')}`
                )
                .setFooter(await embedFooter(interaction));
            await interaction.editReply({ embeds: [embed] });
        }
    },
};
