/**
 * @namespace: addons/economy/commands/guild_stock/view.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class ViewCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('view')
			.setDescription("View the live market data for a server's stock.")
			.addStringOption((option) =>
				option
					.setName('ticker')
					.setDescription(
						"The 2-4 letter stock ticker (leave blank for this server's stock)",
					)
					.setRequired(false),
			);
	async execute(interaction) {
		const container = this.container;
		await interaction.deferReply();
		const { t, models, helpers } = container;
		const { GuildLiquidityPool, GuildTokenHolding } = models;
		const { simpleContainer } = helpers.discord;
		let ticker = interaction.options.getString('ticker');
		let pool = null;
		if (ticker) {
			ticker = ticker.toUpperCase().replace(/[^A-Z]/g, '');
			pool = await GuildLiquidityPool.getCache({
				where: {
					ticker,
				},
			});
		} else {
			pool = await GuildLiquidityPool.getCache({
				where: {
					guildId: interaction.guild.id,
				},
			});
		}
		if (!pool) {
			const errorKey = ticker
				? 'economy.guild_stock.view.error.not_found'
				: 'economy.guild_stock.view.error.no_guild_stock';
			const msg = await t(interaction, errorKey, {
				ticker,
			});
			const components = await simpleContainer(
				interaction,
				await t(
					interaction,
					'economy.commands.guild_stock.view.stock.not_found',
					{
						msg,
					},
				),
				{
					color: 'Red',
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const price = pool.kythReserve / pool.tokenReserve;
		const marketCap = price * pool.tokenReserve;
		const holdersCount = await GuildTokenHolding.countCache({
			where: {
				guildId: pool.guildId,
			},
		});
		const title = await t(
			interaction,
			'economy.commands.guild_stock.view.title',
			{
				ticker: pool.ticker,
			},
		);
		const status = pool.tradingHalted
			? await t(interaction, 'economy.commands.guild_stock.view.halted')
			: await t(interaction, 'economy.commands.guild_stock.view.active');
		const priceStr = await t(
			interaction,
			'economy.commands.guild_stock.view.price',
			{
				price: price.toFixed(4),
			},
		);
		const capStr = await t(
			interaction,
			'economy.commands.guild_stock.view.cap',
			{
				cap: marketCap.toFixed(2),
			},
		);
		const holdersStr = await t(
			interaction,
			'economy.commands.guild_stock.view.holders',
			{
				holders: holdersCount,
			},
		);
		const xStr = await t(interaction, 'economy.commands.guild_stock.view.x', {
			x: pool.kythReserve.toFixed(2),
		});
		const yStr = await t(interaction, 'economy.commands.guild_stock.view.y', {
			y: pool.tokenReserve.toFixed(2),
		});
		const feeStr = await t(
			interaction,
			'economy.commands.guild_stock.view.fee',
			{
				fee: pool.feeRatePct,
			},
		);
		const footer = await t(
			interaction,
			'economy.commands.guild_stock.view.footer',
			{
				guildId: pool.guildId,
			},
		);
		const fullText = await t(
			interaction,
			'economy.commands.guild_stock.view.title_md',
			{
				title,
				status,
				priceStr,
				capStr,
				holdersStr,
				xStr,
				yStr,
				feeStr,
				footer,
			},
		);
		const components = await simpleContainer(interaction, fullText, {
			color: 'Blue',
		});
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
exports.default = ViewCommand;
