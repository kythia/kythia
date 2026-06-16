/**
 * @namespace: addons/economy/commands/guild_stock/portfolio.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { BaseCommand } = require('kythia-core');

class PortfolioCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('portfolio')
			.setDescription('📈 View all the Guild Stocks you currently own.');

	async execute(interaction) {
		const container = this.container;
		await interaction.deferReply();
		const { t, models, helpers } = container;
		const { GuildTokenHolding, GuildLiquidityPool } = models;
		const { simpleContainer } = helpers.discord;
		const { MessageFlags } = require('discord.js');
		const userId = interaction.user.id;

		const holdings = await GuildTokenHolding.getAllCache({
			where: { userId },
		});

		const ownedHoldings = holdings.filter((h) => h.balance > 0);

		if (ownedHoldings.length === 0) {
			const msg = await t(
				interaction,
				'economy.guild_stock.portfolio.empty.desc',
			);
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'economy.stock.portfolio.empty', { msg }),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		let totalKythValue = 0;
		const fieldsText = [];

		for (const holding of ownedHoldings) {
			const pool = await GuildLiquidityPool.getCache({
				where: { guildId: holding.guildId },
			});
			if (pool) {
				const price = pool.kythReserve / pool.tokenReserve;
				const kythValue = price * holding.balance;
				totalKythValue += kythValue;

				const fieldText = await t(
					interaction,
					'economy.guild_stock.portfolio.field',
					{ balance: holding.balance.toFixed(2), value: kythValue.toFixed(4) },
				);
				fieldsText.push(`### $${pool.ticker}\n${fieldText}`);
			}
		}

		const title = await t(interaction, 'economy.guild_stock.portfolio.title');
		const desc = await t(interaction, 'economy.guild_stock.portfolio.desc', {
			value: totalKythValue.toFixed(4),
		});
		const fullText = `## ${title}\n${desc}\n\n${fieldsText.join('\n\n')}`;

		const components = await simpleContainer(interaction, fullText, {
			color: 'Blue',
		});
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = PortfolioCommand;
