/**
 * @namespace: addons/economy/commands/guild_stock/swap.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('swap')
			.setDescription('🔄 Swap KYTH for Guild Tokens, or vice versa via AMM.')
			.addStringOption((option) =>
				option
					.setName('ticker')
					.setDescription('The ticker of the stock to trade (e.g. MEME)')
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('action')
					.setDescription('Are you buying or selling the stock?')
					.setRequired(true)
					.addChoices(
						{ name: 'Buy (Pay KYTH, Get Stock)', value: 'buy' },
						{ name: 'Sell (Pay Stock, Get KYTH)', value: 'sell' },
					),
			)
			.addNumberOption((option) =>
				option
					.setName('amount')
					.setDescription('Amount of stock to buy/sell')
					.setRequired(true)
					.setMinValue(1),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		await interaction.deferReply();
		const { t, models, helpers } = container;
		const { KythiaUser, GuildLiquidityPool, GuildTokenHolding } = models;
		const { simpleContainer } = helpers.discord;
		const { MessageFlags } = require('discord.js');

		const ticker = interaction.options
			.getString('ticker')
			.toUpperCase()
			.replace(/[^A-Z]/g, '');
		const action = interaction.options.getString('action');
		const amount = interaction.options.getNumber('amount');
		const userId = interaction.user.id;

		const pool = await GuildLiquidityPool.getCache({ where: { ticker } });

		if (!pool) {
			const msg = await t(
				interaction,
				'economy.guild_stock.swap.error.not_found',
				{ ticker },
			);
			const components = await simpleContainer(
				interaction,
				`## ❌ Not Found\n${msg}`,
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		if (pool.tradingHalted) {
			const msg = await t(
				interaction,
				'economy.guild_stock.swap.error.halted',
				{ ticker },
			);
			const components = await simpleContainer(
				interaction,
				`## ⚠️ Trading Halted\n${msg}`,
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const [userEco] = await KythiaUser.findOrCreateWithCache({
			where: { userId },
			defaults: { userId },
		});

		const [userHolding] = await GuildTokenHolding.findOrCreateWithCache({
			where: { userId, guildId: pool.guildId },
			defaults: { userId, guildId: pool.guildId, balance: 0 },
		});

		const feePct = pool.feeRatePct / 100;
		const K = pool.kConstant;

		if (action === 'buy') {
			const newY = pool.tokenReserve - amount;
			if (newY <= 0) {
				const msg = await t(
					interaction,
					'economy.guild_stock.swap.error.liquidity',
				);
				const components = await simpleContainer(
					interaction,
					`## ❌ Liquidity Error\n${msg}`,
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			const newX = K / newY;
			const costKyth = newX - pool.kythReserve;
			const fee = costKyth * feePct;
			const totalCost = costKyth + fee;

			if ((userEco.kythHolding || 0) < totalCost) {
				const msg = await t(
					interaction,
					'economy.guild_stock.swap.error.funds',
					{
						cost: totalCost.toFixed(4),
						amount,
						ticker,
						balance: (userEco.kythHolding || 0).toFixed(4),
					},
				);
				const components = await simpleContainer(
					interaction,
					`## ❌ Insufficient Funds\n${msg}`,
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			userEco.kythHolding -= totalCost;
			userHolding.balance += amount;

			pool.kythReserve += costKyth;
			pool.kythReserve += fee;
			pool.tokenReserve -= amount;

			await Promise.all([userEco.save(), userHolding.save(), pool.save()]);

			const msg = await t(interaction, 'economy.guild_stock.swap.success.buy', {
				amount,
				ticker,
				cost: totalCost.toFixed(4),
				balance: userHolding.balance.toFixed(2),
			});
			const components = await simpleContainer(
				interaction,
				`## ✅ Swap Successful\n${msg}`,
				{ color: 'Green' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} else {
			if (userHolding.balance < amount) {
				const msg = await t(
					interaction,
					'economy.guild_stock.swap.error.balance',
					{ ticker, balance: userHolding.balance.toFixed(2) },
				);
				const components = await simpleContainer(
					interaction,
					`## ❌ Insufficient Balance\n${msg}`,
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			const newY = pool.tokenReserve + amount;
			const newX = K / newY;
			const kythOutput = pool.kythReserve - newX;
			const fee = kythOutput * feePct;
			const finalOutput = kythOutput - fee;

			if (pool.kythReserve <= kythOutput) {
				const msg = await t(
					interaction,
					'economy.guild_stock.swap.error.kyth_liquidity',
				);
				const components = await simpleContainer(
					interaction,
					`## ❌ Liquidity Error\n${msg}`,
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			userHolding.balance -= amount;
			userEco.kythHolding += finalOutput;

			pool.kythReserve -= kythOutput;
			pool.kythReserve += fee;
			pool.tokenReserve += amount;

			await Promise.all([userEco.save(), userHolding.save(), pool.save()]);

			const msg = await t(
				interaction,
				'economy.guild_stock.swap.success.sell',
				{
					amount,
					ticker,
					earned: finalOutput.toFixed(4),
					balance: userHolding.balance.toFixed(2),
				},
			);
			const components = await simpleContainer(
				interaction,
				`## ✅ Swap Successful\n${msg}`,
				{ color: 'Green' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	},
};
