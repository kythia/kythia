/**
 * @namespace: addons/economy/commands/market/portfolio.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const {
	MessageFlags,
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
const { getMarketData } = require('../../helpers/market');

function getChangeEmoji(percent) {
	if (percent > 0) return '🟢 ▲';
	if (percent < 0) return '🔴 ▼';
	return '⏹️';
}

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('portfolio')
			.setDescription('💼 View your personal asset portfolio.'),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, kythiaConfig, helpers } = container;
		const { KythiaUser, MarketPortfolio } = models;
		const { simpleContainer } = helpers.discord;
		const { convertColor } = helpers.color;

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

		const userHoldings = await MarketPortfolio.getAllCache({
			where: { userId: interaction.user.id },
			cacheTags: [`MarketPortfolio:byUser:${interaction.user.id}`],
		});

		if (userHoldings.length === 0) {
			const msg = await t(interaction, 'economy.market.portfolio.empty.desc');
			const components = await simpleContainer(interaction, msg, {
				color: kythiaConfig.bot.color,
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const marketData = await getMarketData();
		let totalValue = 0;
		let totalPnl = 0;
		let totalInvested = 0;
		let totalUnrealizedLoss = 0;
		let totalUnrealizedGain = 0;

		const portfolioSections = [];

		for (const holding of userHoldings) {
			const currentAssetData = marketData[holding.assetId];
			if (!currentAssetData) {
				portfolioSections.push(
					`### 💠 ${holding.assetId.toUpperCase()}\n${await t(
						interaction,
						'economy.market.portfolio.data.unavailable',
						{ quantity: holding.quantity },
					)}`,
				);
				continue;
			}

			const priceNow = currentAssetData.usd;
			const price24h =
				typeof currentAssetData.usd_24h_change === 'number'
					? priceNow - priceNow * (currentAssetData.usd_24h_change / 100)
					: null;

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
			const change24hSign =
				currentAssetData.usd_24h_change > 0
					? '+'
					: currentAssetData.usd_24h_change < 0
						? ''
						: '';
			const change24hEmoji = getChangeEmoji(currentAssetData.usd_24h_change);

			const lines = [
				`### 💠 ${holding.assetId.toUpperCase()}${pnl > 0 ? '  📈' : pnl < 0 ? '  📉' : ''}`,
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
			]
				.filter(Boolean)
				.join('\n');

			portfolioSections.push(lines);
		}

		const totalPnlSign = totalPnl > 0 ? '+' : totalPnl < 0 ? '-' : '';
		const totalPnlEmoji = totalPnl > 0 ? '📈' : totalPnl < 0 ? '📉' : '⏹️';
		const totalReturnPct =
			totalInvested > 0
				? ((totalPnl / totalInvested) * 100).toFixed(2)
				: '0.00';

		const summaryLines = [
			`## ${await t(interaction, 'economy.market.portfolio.title', { username: interaction.user.username })}`,
			`**${await t(interaction, 'economy.market.portfolio.summary.total.invested')}** \`$${totalInvested.toLocaleString(undefined, { maximumFractionDigits: 2 })}\``,
			`**${await t(interaction, 'economy.market.portfolio.summary.market.value')}** \`$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}\``,
			`**${await t(interaction, 'economy.market.portfolio.summary.total.pl')}** \`${totalPnlEmoji} ${totalPnlSign}$${Math.abs(totalPnl).toLocaleString(undefined, { maximumFractionDigits: 2 })}\` (${totalPnlSign}${totalReturnPct}%)`,
			`**${await t(interaction, 'economy.market.portfolio.summary.unrealized.gains')}** \`📈 +$${totalUnrealizedGain.toLocaleString(undefined, { maximumFractionDigits: 2 })}\``,
			`**${await t(interaction, 'economy.market.portfolio.summary.unrealized.losses')}** \`📉 -$${totalUnrealizedLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}\``,
		].join('\n');

		const fullContent = [summaryLines, '', ...portfolioSections].join('\n\n');

		const portfolioContainer = new ContainerBuilder()
			.setAccentColor(
				convertColor(totalPnl >= 0 ? '#00FF00' : '#FF0000', {
					from: 'hex',
					to: 'decimal',
				}),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(fullContent),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(interaction, 'common.container.footer', {
						username: interaction.client.user.username,
					}),
				),
			);

		await interaction.editReply({
			components: [portfolioContainer],
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
