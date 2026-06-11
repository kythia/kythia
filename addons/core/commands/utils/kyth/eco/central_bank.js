/**
 * @namespace: addons/core/commands/utils/kyth/eco/central_bank.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('central_bank')
			.setDescription("🏦 (Owner) Control Kythia's Global Monetary Policy.")
			.addNumberOption((option) =>
				option
					.setName('fee_rate')
					.setDescription('Trading fee % (e.g. 2 for 2%)')
					.setRequired(false)
					.setMinValue(0)
					.setMaxValue(100),
			)
			.addNumberOption((option) =>
				option
					.setName('dividend_split')
					.setDescription('% of taxes distributed to stakers')
					.setRequired(false)
					.setMinValue(0)
					.setMaxValue(100),
			)
			.addNumberOption((option) =>
				option
					.setName('burn_rate')
					.setDescription('Auto-burn % of pool reserves per cycle')
					.setRequired(false)
					.setMinValue(0)
					.setMaxValue(100),
			)
			.addBooleanOption((option) =>
				option
					.setName('halt_trading')
					.setDescription('Emergency kill switch to halt all market trading')
					.setRequired(false),
			),
	// Restrict this command specifically to the bot owner using middleware or permissions
	// Since there is no explicit owner guard inside economy addon, we rely on the X-Owner-Id or internal checks, but usually it's set in the global config.
	// For Kythia, owner commands in economy should check if user is owner.
	ownerOnly: true,

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		await interaction.deferReply();
		const { t, models, helpers, kythiaConfig } = container;
		const { simpleContainer } = helpers.discord;
		const { MessageFlags } = require('discord.js');

		// If the command handler doesn't naturally support ownerOnly flag, we can do a manual check against kythiaConfig.
		const isOwner = kythiaConfig.bot.owners.includes(interaction.user.id);
		if (!isOwner) {
			const msg = await t(
				interaction,
				'economy.guild_stock.central_bank.error.owner',
			);
			const components = await simpleContainer(
				interaction,
				`## ❌ Access Denied\n${msg}`,
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const { KythLiquidityPool } = models;
		const pool = await KythLiquidityPool.getCache({ id: 1 });

		if (!pool) {
			const msg = await t(
				interaction,
				'economy.guild_stock.central_bank.error.db',
			);
			const components = await simpleContainer(
				interaction,
				`## ❌ Database Error\n${msg}`,
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const feeRate = interaction.options.getNumber('fee_rate');
		const dividendSplit = interaction.options.getNumber('dividend_split');
		const burnRate = interaction.options.getNumber('burn_rate');
		const haltTrading = interaction.options.getBoolean('halt_trading');

		const changes = [];

		if (feeRate !== null) {
			changes.push(`**Trading Fee:** ${pool.feeRatePct}% ➔ ${feeRate}%`);
			pool.feeRatePct = feeRate;
		}
		if (dividendSplit !== null) {
			changes.push(
				`**Dividend Split:** ${pool.dividendSplitPct}% ➔ ${dividendSplit}%`,
			);
			pool.dividendSplitPct = dividendSplit;
		}
		if (burnRate !== null) {
			changes.push(`**Auto Burn Rate:** ${pool.burnRatePct}% ➔ ${burnRate}%`);
			pool.burnRatePct = burnRate;
		}
		if (haltTrading !== null) {
			changes.push(
				`**Trading Halted:** ${pool.tradingHalted} ➔ ${haltTrading}`,
			);
			pool.tradingHalted = haltTrading;
		}

		if (changes.length === 0) {
			const title = await t(
				interaction,
				'economy.guild_stock.central_bank.title',
			);
			const msg = await t(
				interaction,
				'economy.guild_stock.central_bank.current',
				{
					fee: pool.feeRatePct,
					dividend: pool.dividendSplitPct,
					burn: pool.burnRatePct,
					halted: pool.tradingHalted,
				},
			);
			const components = await simpleContainer(
				interaction,
				`## ${title}\n${msg}`,
				{ color: 'Blue' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		await pool.save();

		const title = await t(
			interaction,
			'economy.guild_stock.central_bank.title',
		);
		const msg = await t(
			interaction,
			'economy.guild_stock.central_bank.success',
			{ changes: changes.join('\n') },
		);
		const components = await simpleContainer(
			interaction,
			`## ${title} Updated\n${msg}`,
			{ color: 'Green' },
		);
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
