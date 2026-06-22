/**
 * @namespace: addons/economy/commands/guild_stock/top.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { BaseCommand } = require('kythia-core');
class TopCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('top')
			.setDescription(
				'View the top Guild Stocks by Market Cap (The Kythia S&P 500).',
			);
	async execute(interaction) {
		const container = this.container;
		await interaction.deferReply();
		const { t, models, helpers } = container;
		const { GuildLiquidityPool } = models;
		const { simpleContainer } = helpers.discord;
		const { MessageFlags } = require('discord.js');
		const pools = await GuildLiquidityPool.getAllCache();
		if (!pools || pools.length === 0) {
			const msg = await t(
				interaction,
				'economy.commands.guild_stock.top.empty',
			);
			const title = await t(
				interaction,
				'economy.shared.guild_stock.top.title',
			);
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'economy.commands.guild_stock.top.title_md', {
					title,
					msg,
				}),
				{
					color: 'Red',
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		// Calculate market cap for each pool
		const mappedPools = pools.map((pool) => {
			const price = pool.kythReserve / pool.tokenReserve;
			const marketCap = price * pool.tokenReserve; // which is mathematically just pool.kythReserve, but good to be explicit
			return {
				...pool.toJSON(),
				price,
				marketCap,
			};
		});

		// Sort by Market Cap descending
		mappedPools.sort((a, b) => b.marketCap - a.marketCap);
		const topPools = mappedPools.slice(0, 10);
		const title = await t(interaction, 'economy.shared.guild_stock.top.title');
		const desc = await t(interaction, 'economy.commands.guild_stock.top.desc');
		let description = '';
		for (let i = 0; i < topPools.length; i++) {
			const p = topPools[i];
			let medal = '🔹';
			if (i === 0) medal = '🥇';
			else if (i === 1) medal = '🥈';
			else if (i === 2) medal = '🥉';
			description += `${medal} **$${p.ticker}** — **${p.marketCap.toFixed(2)}** KYTH (Price: ${p.price.toFixed(4)})\n`;
		}
		const fullText = await t(
			interaction,
			'economy.commands.guild_stock.top.full_title_md',
			{
				title,
				desc,
				description,
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
exports.default = TopCommand;
