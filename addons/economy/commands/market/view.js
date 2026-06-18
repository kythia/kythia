/**
 * @namespace: addons/economy/commands/market/view.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	ContainerBuilder,
	SeparatorBuilder,
	AttachmentBuilder,
	TextDisplayBuilder,
	MediaGalleryBuilder,
	SeparatorSpacingSize,
	MediaGalleryItemBuilder,
} = require('discord.js');
const {
	ASSET_IDS,
	getMarketData,
	KYTH_ASSET_ID,
	getChartBuffer,
	renderChartFromData,
} = require('../../helpers/market');
const {
	TOP_STOCKS,
	getStockData,
	getTopStocksData,
	getStockChartBuffer,
} = require('../../helpers/stock');
const { getSpotPrice, formatPoolStats } = require('../../helpers/kythAmm');
const { Op } = require('sequelize');
const { BaseCommand } = require('kythia-core');
const marketuiHelper = require('../../helpers/marketUi');

// Helpers extracted to addons/economy/helpers/market-ui.js

class ViewCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('view')
			.setDescription('View real-time crypto prices from the global market.')
			.addStringOption((option) =>
				option
					.setName('asset')
					.setDescription(
						'Symbol of the asset to view (e.g. bitcoin, AAPL), or leave empty for all',
					)
					.setRequired(false)
					.setAutocomplete(true),
			)
			.addStringOption((option) =>
				option
					.setName('timeframe')
					.setDescription('The time range for the chart (default: 7 Days)')
					.setRequired(false)
					.addChoices(
						{
							name: '1 Day',
							value: '1',
						},
						{
							name: '7 Days',
							value: '7',
						},
						{
							name: '14 Days',
							value: '14',
						},
						{
							name: '30 Days',
							value: '30',
						},
						{
							name: '90 Days',
							value: '90',
						},
						{
							name: '365 Days',
							value: '365',
						},
					),
			);
	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused().toLowerCase();
		const combined = [
			...ASSET_IDS.map((id) => id.toUpperCase()),
			...TOP_STOCKS,
		];
		const filtered = combined.filter((choice) =>
			choice.toLowerCase().includes(focusedValue),
		);
		await interaction.respond(
			filtered.slice(0, 25).map((choice) => ({
				name: choice,
				value: choice.toLowerCase(),
			})),
		);
	}
	async execute(interaction) {
		const container = this.container;
		const { t, models, kythiaConfig, helpers } = container;
		const { KythiaUser, MarketOrder, KythLiquidityPool, MarketTransaction } =
			models;
		const { simpleContainer } = helpers.discord;
		const { convertColor } = helpers.color;
		await interaction.deferReply();
		const user = await KythiaUser.getCache({
			userId: interaction.user.id,
		});
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
		const assetId = interaction.options.getString('asset');
		const timeframe = interaction.options.getString('timeframe') || '7';
		const files = [];

		// ─── KYTH AMM View ─────────────────────────────────────────────────────────
		if (assetId === KYTH_ASSET_ID) {
			const pool = await KythLiquidityPool.getCache(
				{
					id: 1,
				},
				{
					noCache: true,
				},
			);
			const userKyth = Number(user.kythHolding) || 0;
			const userStaked = Number(user.kythStaked) || 0;
			if (!pool) {
				const components = await simpleContainer(
					interaction,
					await t(interaction, 'economy.market.view.pool_not_found_md'),
					{
						color: 'Red',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			const stats = formatPoolStats(pool);
			const spotPrice = getSpotPrice(pool);

			// Recent trades for 24h change simulation
			const recentTrades =
				(await MarketTransaction.getAllCache({
					where: {
						assetId: 'kyth',
					},
					order: [['createdAt', 'DESC']],
					limit: 50,
				})) ?? [];

			// Rough 24h change: compare current price vs oldest recent trade
			let change24h = 0;
			if (recentTrades.length > 1) {
				const oldestPrice = recentTrades[recentTrades.length - 1].price;
				change24h =
					oldestPrice > 0 ? ((spotPrice - oldestPrice) / oldestPrice) * 100 : 0;
			}
			const changeEmoji = change24h >= 0 ? '🟢 ▲' : '🔴 ▼';
			const kDriftWarning =
				parseFloat(stats.kDriftPct) > 0.1
					? `\n> ⚠️ **K Drift:** ${stats.kDriftPct}% (admin recalc recommended)`
					: '';
			const dataPoints = [];
			const daysNum = parseInt(timeframe, 10) || 7;
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - daysNum);
			const allTrades = await MarketTransaction.getAllCache({
				where: {
					assetId: 'kyth',
					createdAt: {
						[Op.gte]: startDate,
					},
				},
				order: [['createdAt', 'ASC']],
			});
			if (allTrades.length > 0) {
				let binSizeMs = 1000 * 60 * 60 * 24;
				if (daysNum === 1) binSizeMs = 1000 * 60 * 30;
				else if (daysNum <= 14) binSizeMs = 1000 * 60 * 60 * 4;
				else if (daysNum === 365) binSizeMs = 1000 * 60 * 60 * 24 * 4;
				const firstDateVal =
					allTrades[0].createdAt || allTrades[0].created_at || new Date();
				let currentBinStart =
					Math.floor(new Date(firstDateVal).getTime() / binSizeMs) * binSizeMs;
				let currentBin = [];
				for (const trade of allTrades) {
					const tradeDateVal =
						trade.createdAt || trade.created_at || new Date();
					const tradeTime = new Date(tradeDateVal).getTime();
					if (tradeTime < currentBinStart + binSizeMs) {
						currentBin.push(trade.price);
					} else {
						if (currentBin.length > 0) {
							dataPoints.push({
								x: currentBinStart,
								o: currentBin[0],
								h: Math.max(...currentBin),
								l: Math.min(...currentBin),
								c: currentBin[currentBin.length - 1],
							});
						}
						currentBinStart = Math.floor(tradeTime / binSizeMs) * binSizeMs;
						currentBin = [trade.price];
					}
				}
				if (currentBin.length > 0) {
					dataPoints.push({
						x: currentBinStart,
						o: currentBin[0],
						h: Math.max(...currentBin),
						l: Math.min(...currentBin),
						c: currentBin[currentBin.length - 1],
					});
				}
			}
			let mediaUrl = null;
			if (dataPoints.length > 0) {
				const chartBuffer = await renderChartFromData(
					kythiaConfig,
					'kyth',
					dataPoints,
				);
				if (chartBuffer) {
					const attachment = new AttachmentBuilder(chartBuffer, {
						name: 'kyth-chart.png',
					});
					files.push(attachment);
					mediaUrl = 'attachment://kyth-chart.png';
				}
			}
			const description = [
				await t(interaction, 'economy.market.view.title_md'),
				`*Powered by Kythia's on-chain Automated Market Maker (X×Y=K)*`,
				``,
				`**💰 Spot Price:** ${stats.spotPrice} Coin/KYTH`,
				`**${changeEmoji} 24h Change:** ${change24h.toFixed(2)}%`,
				``,
				`**📊 Pool Reserves**`,
				`\`\`\``,
				`Coin Reserve (X): ${stats.coinReserve}`,
				`KYTH Reserve (Y): ${stats.kythReserve}`,
				`K Constant:       ${stats.kConstant}`,
				`K Drift:          ${stats.kDriftPct}%`,
				`\`\`\``,
				``,
				`**🌊 Market Stats**`,
				`\`\`\``,
				`Circulating Supply: ${stats.circulatingSupply} KYTH`,
				`Market Cap (FDV):   ${stats.fdv} Coin`,
				`TVL (Pool):         ${stats.tvl} Coin`,
				`Staker Rewards:     ${stats.totalTaxCollected} Coin (pending)`,
				`\`\`\``,
				``,
				`**💎 Your KYTH**`,
				`Wallet: **${userKyth.toFixed(6)} KYTH** ≈ 🪙 ${(
					userKyth * spotPrice
				).toLocaleString(undefined, {
					maximumFractionDigits: 2,
				})} Coin`,
				`Staked: **${userStaked.toFixed(6)} KYTH**${kDriftWarning}`,
			].join('\n');
			const viewContainer = new ContainerBuilder()
				.setAccentColor(
					convertColor(kythiaConfig.bot.color, {
						from: 'hex',
						to: 'decimal',
					}),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(description),
				);
			if (mediaUrl) {
				viewContainer
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addMediaGalleryComponents(
						new MediaGalleryBuilder().addItems([
							new MediaGalleryItemBuilder().setURL(mediaUrl),
						]),
					);
			}
			viewContainer
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
			return interaction.editReply({
				components: [viewContainer],
				files: files,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const marketData = await getMarketData();
		if (assetId) {
			const isCrypto = ASSET_IDS.includes(assetId);
			// const isStock = !isCrypto;

			let data, price, percent, emoji, assetName;
			if (isCrypto) {
				data = marketData[assetId];
				if (!data)
					return marketuiHelper.assetNotFound(interaction, assetId, t, helpers);
				price = data.usd;
				percent = data.usd_24h_change;
				assetName = assetId.toUpperCase();
			} else {
				data = await getStockData(assetId);
				if (!data)
					return marketuiHelper.assetNotFound(interaction, assetId, t, helpers);
				price = data.price;
				percent = data.changePercent;
				assetName = data.symbol;
			}
			emoji = marketuiHelper.getChangeEmoji(percent);
			let description = `${await t(
				interaction,
				'economy.market.view.chart.title_md',
				{
					title: await t(interaction, 'economy.market.view.chart.title', {
						asset: assetName,
						timeframe,
					}),
				},
			)}\n\n`;
			description += `**${await t(interaction, 'economy.market.view.price.label')}:** $${price.toLocaleString(
				'en-US',
				{
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				},
			)}\n`;
			description += `**${await t(interaction, 'economy.market.view.24h.change.label')}:** ${emoji} ${percent.toFixed(2)}%\n`;
			const openOrders = await MarketOrder.getAllCache({
				where: {
					userId: interaction.user.id,
					assetId: assetId,
					status: 'open',
				},
				cacheTags: [
					`MarketOrder:open:byUser:${interaction.user.id}:byAsset:${assetId}`,
				],
			});
			if (openOrders.length > 0) {
				const orderSummary = openOrders
					.map((order) => {
						return `- **${order.side.toUpperCase()} ${order.quantity} ${assetName}** at $${order.price} (${order.type})`;
					})
					.join('\n');
				description += `\n**${await t(interaction, 'economy.market.view.open.orders.label')}:**\n${orderSummary}`;
			}
			const chartBuffer = isCrypto
				? await getChartBuffer(kythiaConfig, assetId, timeframe)
				: await getStockChartBuffer(kythiaConfig, assetId, timeframe);
			let mediaUrl = null;
			if (chartBuffer) {
				const attachment = new AttachmentBuilder(chartBuffer, {
					name: 'market-chart.png',
				});
				files.push(attachment);
				mediaUrl = 'attachment://market-chart.png';
			}
			const viewContainer = new ContainerBuilder()
				.setAccentColor(
					convertColor(kythiaConfig.bot.color, {
						from: 'hex',
						to: 'decimal',
					}),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(description),
				);
			if (mediaUrl) {
				viewContainer
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addMediaGalleryComponents(
						new MediaGalleryBuilder().addItems([
							new MediaGalleryItemBuilder().setURL(mediaUrl),
						]),
					);
			}
			viewContainer
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
				components: [viewContainer],
				files: files,
				flags: MessageFlags.IsComponentsV2,
			});
		} else {
			const assetRows = ASSET_IDS.map((id) => {
				const data = marketData[id];
				if (!data) {
					return `${id.toUpperCase().padEnd(8)}| ${'Data not found'.padEnd(15)}| N/A`;
				}
				const symbol = id.toUpperCase().padEnd(8);
				const price = `$${data.usd.toLocaleString('en-US', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				})}`.padEnd(15);
				const changeVal = data.usd_24h_change || 0;
				const percent = changeVal.toFixed(2);
				const emoji = marketuiHelper.getChangeEmoji(changeVal);
				const change = `${emoji} ${percent}%`;
				return `${symbol}| ${price}| ${change}`;
			});
			const topStocksData = await getTopStocksData();
			const stockRows = TOP_STOCKS.map((id) => {
				const data = topStocksData[id];
				if (!data) return null;
				const symbol = data.symbol.padEnd(8);
				const price = `$${data.price.toLocaleString('en-US', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				})}`.padEnd(15);
				const changeVal = data.changePercent || 0;
				const percent = changeVal.toFixed(2);
				const emoji = marketuiHelper.getChangeEmoji(changeVal);
				const change = `${emoji} ${percent}%`;
				return `${symbol}| ${price}| ${change}`;
			}).filter(Boolean);
			const cryptoTable = marketuiHelper.formatMarketTable(assetRows);
			const stockTable = marketuiHelper.formatMarketTable(stockRows);
			const msg =
				`${await t(interaction, 'economy.market.view.all.title')}\n` +
				`**Top Crypto**\n${cryptoTable}\n` +
				`**Top Stocks**\n${stockTable}`;
			const components = await simpleContainer(interaction, msg, {
				color: kythiaConfig.bot.color,
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}
exports.default = ViewCommand;
