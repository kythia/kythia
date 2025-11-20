/**
 * @namespace: addons/economy/commands/market/portfolio.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { EmbedBuilder } = require('discord.js');
const { getMarketData } = require('../../helpers/market');

function getChangeEmoji(percent) {
    if (percent > 0) return '🟢 ▲';
    if (percent < 0) return '🔴 ▼';
    return '⏹️';
}

module.exports = {
    subcommand: true,
    data: (subcommand) => subcommand.setName('portfolio').setDescription('💼 View your personal asset portfolio.'),

    async execute(interaction, container) {
        const { t, models, kythiaConfig, helpers } = container;
        const { KythiaUser, MarketPortfolio } = models;
        const { embedFooter } = helpers.discord;

        await interaction.deferReply();

        let user = await KythiaUser.getCache({ userId: interaction.user.id });
        if (!user) {
            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setDescription(await t(interaction, 'economy.withdraw.no.account.desc'))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const userHoldings = await MarketPortfolio.getAllCache({
            where: { userId: interaction.user.id },
            cacheTags: [`MarketPortfolio:byUser:${interaction.user.id}`],
        });

        if (userHoldings.length === 0) {
            const emptyEmbed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setDescription(
                    `## ${await t(interaction, 'economy.market.portfolio.empty.title')}\n${await t(interaction, 'economy.market.portfolio.empty.desc')}`
                )
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [emptyEmbed] });
        }

        const marketData = await getMarketData();
        let totalValue = 0;
        let totalPnl = 0;
        let totalInvested = 0;
        let totalUnrealizedLoss = 0;
        let totalUnrealizedGain = 0;

        const portfolioFields = [];

        for (let holding of userHoldings) {
            const currentAssetData = marketData[holding.assetId];
            if (!currentAssetData) {
                portfolioFields.push({
                    name: `${holding.assetId.toUpperCase()}`,
                    value: await t(interaction, 'economy.market.portfolio.data.unavailable', { quantity: holding.quantity }),
                    inline: false,
                });
                continue;
            }

            const priceNow = currentAssetData.usd;
            const price24h =
                typeof currentAssetData.usd_24h_change === 'number' ? priceNow - priceNow * (currentAssetData.usd_24h_change / 100) : null;

            const currentValue = holding.quantity * priceNow;
            const invested = holding.quantity * holding.avgBuyPrice;
            totalValue += currentValue;
            totalInvested += invested;

            const pnl = currentValue - invested;
            totalPnl += pnl;

            if (pnl >= 0) {
                totalUnrealizedGain += pnl;
            } else {
                totalUnrealizedLoss += Math.abs(pnl);
            }

            const pnlSign = pnl > 0 ? '+' : pnl < 0 ? '-' : '';
            const pnlEmoji = pnl > 0 ? '📈' : pnl < 0 ? '📉' : '⏹️';
            const change24hSign = currentAssetData.usd_24h_change > 0 ? '+' : currentAssetData.usd_24h_change < 0 ? '' : '';
            const change24hEmoji = getChangeEmoji(currentAssetData.usd_24h_change);

            const lines = [
                `> **${await t(interaction, 'economy.market.portfolio.field.quantity')}** \`${holding.quantity}\``,
                `> **${await t(interaction, 'economy.market.portfolio.field.avg.buy.price')}** \`$${holding.avgBuyPrice.toLocaleString(undefined, { maximumFractionDigits: 8 })}\``,
                `> **${await t(interaction, 'economy.market.portfolio.field.current.price')}** \`$${priceNow.toLocaleString(undefined, { maximumFractionDigits: 8 })}\``,
                price24h !== null
                    ? `> **${await t(interaction, 'economy.market.portfolio.field.price.24h.ago')}** \`$${price24h.toLocaleString(undefined, { maximumFractionDigits: 8 })}\``
                    : null,
                `> **${await t(interaction, 'economy.market.portfolio.field.24h.change')}** \`${change24hEmoji} ${change24hSign}${currentAssetData.usd_24h_change?.toFixed(2) ?? '--'}%\``,
                `> **${await t(interaction, 'economy.market.portfolio.field.invested')}** \`$${invested.toLocaleString(undefined, { maximumFractionDigits: 2 })}\``,
                `> **${await t(interaction, 'economy.market.portfolio.field.market.value')}** \`$${currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}\``,
                `> **${await t(interaction, 'economy.market.portfolio.field.pl')}** \`${pnlEmoji} ${pnlSign}$${Math.abs(pnl).toLocaleString(undefined, { maximumFractionDigits: 2 })}\` (${pnlSign}${((pnl / invested) * 100 || 0).toFixed(2)}%)`,
            ].filter(Boolean);

            portfolioFields.push({
                name: `💠 ${holding.assetId.toUpperCase()}${pnl > 0 ? '  📈' : pnl < 0 ? '  📉' : ''}`,
                value: lines.join('\n'),
                inline: false,
            });
        }

        const totalPnlSign = totalPnl > 0 ? '+' : totalPnl < 0 ? '-' : '';
        const totalPnlEmoji = totalPnl > 0 ? '📈' : totalPnl < 0 ? '📉' : '⏹️';
        const totalReturnPct = totalInvested > 0 ? ((totalPnl / totalInvested) * 100).toFixed(2) : '0.00';

        const summaryLines = [
            `**${await t(interaction, 'economy.market.portfolio.summary.total.invested')}** \`$${totalInvested.toLocaleString(undefined, { maximumFractionDigits: 2 })}\``,
            `**${await t(interaction, 'economy.market.portfolio.summary.market.value')}** \`$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}\``,
            `**${await t(interaction, 'economy.market.portfolio.summary.total.pl')}** \`${totalPnlEmoji} ${totalPnlSign}$${Math.abs(totalPnl).toLocaleString(undefined, { maximumFractionDigits: 2 })}\` (${totalPnlSign}${totalReturnPct}%)`,
            `**${await t(interaction, 'economy.market.portfolio.summary.unrealized.gains')}** \`📈 +$${totalUnrealizedGain.toLocaleString(undefined, { maximumFractionDigits: 2 })}\``,
            `**${await t(interaction, 'economy.market.portfolio.summary.unrealized.losses')}** \`📉 -$${totalUnrealizedLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}\``,
        ];

        const embed = new EmbedBuilder()
            .setColor(totalPnl >= 0 ? 'Green' : 'Red')
            .setDescription(
                `## ${await t(interaction, 'economy.market.portfolio.title', { username: interaction.user.username })}\n${summaryLines.join('\n')}`
            )
            .addFields(portfolioFields)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setFooter(await embedFooter(interaction));

        await interaction.editReply({ embeds: [embed] });
    },
};
