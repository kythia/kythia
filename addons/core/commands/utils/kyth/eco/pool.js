/**
 * @namespace: addons/core/commands/utils/kyth/eco/pool.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const {
	getSpotPrice,
	formatPoolStats,
} = require('../../../../../economy/helpers/kythAmm');
const { BaseCommand } = require('kythia-core');
class PoolCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('pool')
			.setDescription('Manage the KYTH AMM liquidity pool.')
			.addStringOption((option) =>
				option
					.setName('action')
					.setDescription('What to do?')
					.setRequired(true)
					.addChoices(
						{
							name: 'Status — View pool state',
							value: 'status',
						},
						{
							name: 'Inject — Add coin/kyth to pool',
							value: 'inject',
						},
						{
							name: 'Set — Set a specific reserve value',
							value: 'set',
						},
						{
							name: 'Recalculate K — Recompute K from current reserves',
							value: 'recalculate',
						},
					),
			)
			.addIntegerOption((option) =>
				option
					.setName('coin')
					.setDescription(
						'[inject/set] Kythia Coin amount (can be negative to reduce)',
					)
					.setRequired(false),
			)
			.addNumberOption((option) =>
				option
					.setName('kyth')
					.setDescription(
						'[inject/set] KYTH token amount (can be negative to reduce)',
					)
					.setRequired(false),
			);
	async execute(interaction) {
		const container = this.container;
		const { models, kythiaConfig, helpers, t } = container;
		const { KythLiquidityPool } = models;
		const { simpleContainer } = helpers.discord;
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});
		const action = interaction.options.getString('action');
		const coinDelta = interaction.options.getInteger('coin');
		const kythDelta = interaction.options.getNumber('kyth');
		const pool = await KythLiquidityPool.getCache(
			{
				id: 1,
			},
			{
				noCache: true,
			},
		);
		if (!pool) {
			const components = await simpleContainer(
				interaction,
				'❌ Pool Not Found\nThe KYTH liquidity pool (id=1) does not exist. Run the database migration first.',
				{
					color: 'Red',
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		if (action === 'status') {
			const stats = formatPoolStats(pool);
			const msg = [
				`🏊 KYTH Liquidity Pool Status`,
				``,
				`**💰 Coin Reserve (X):** 🪙 ${stats.coinReserve}`,
				`**💎 KYTH Reserve (Y):** ${stats.kythReserve} KYTH`,
				`**📐 K Constant:** ${stats.kConstant}`,
				`**📈 Spot Price:** ${stats.spotPrice} Coin/KYTH`,
				`**🌊 Market Cap:** 🪙 ${stats.marketCap}`,
				`**💸 Tax Collected:** 🪙 ${stats.totalTaxCollected}`,
				`**🔥 Last Burn:** ${pool.lastBurnAt ? `<t:${Math.floor(new Date(pool.lastBurnAt).getTime() / 1000)}:R>` : 'Never'}`,
			].join('\n');
			const components = await simpleContainer(interaction, msg, {
				color: kythiaConfig.bot.color,
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		if (action === 'inject') {
			if (coinDelta === null && kythDelta === null) {
				const components = await simpleContainer(
					interaction,
					'You must provide at least one of `--coin` or `--kyth` to inject.',
					{
						color: 'Red',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			const oldCoin = Number(pool.coinReserve);
			const oldKyth = Number(pool.kythReserve);
			const oldPrice = getSpotPrice({
				coinReserve: oldCoin,
				kythReserve: oldKyth,
			});
			if (coinDelta !== null) {
				pool.coinReserve = Math.max(1, oldCoin + coinDelta);
				pool.changed('coinReserve', true);
			}
			if (kythDelta !== null) {
				pool.kythReserve = Math.max(0.000001, oldKyth + kythDelta);
				pool.changed('kythReserve', true);
			}

			// Auto-recalculate K after injection
			pool.kConstant = Number(pool.coinReserve) * Number(pool.kythReserve);
			pool.changed('kConstant', true);
			await pool.save();
			const newPrice = getSpotPrice({
				coinReserve: Number(pool.coinReserve),
				kythReserve: Number(pool.kythReserve),
			});
			const msg = [
				`✅ Pool Injection Complete`,
				`**Coin:** ${oldCoin.toLocaleString()} → ${Number(pool.coinReserve).toLocaleString()} (${coinDelta !== null ? (coinDelta >= 0 ? '+' : '') + coinDelta.toLocaleString() : 'unchanged'})`,
				`**KYTH:** ${oldKyth.toFixed(4)} → ${Number(pool.kythReserve).toFixed(4)} (${kythDelta !== null ? (kythDelta >= 0 ? '+' : '') + kythDelta.toFixed(4) : 'unchanged'})`,
				`**New K:** ${pool.kConstant.toLocaleString()}`,
				`**Price Change:** ${oldPrice.toFixed(4)} → ${newPrice.toFixed(4)} Coin/KYTH`,
			].join('\n');
			const components = await simpleContainer(interaction, msg, {
				color: 'Green',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		if (action === 'set') {
			if (coinDelta === null && kythDelta === null) {
				const components = await simpleContainer(
					interaction,
					'You must provide at least one value to set.',
					{
						color: 'Red',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			if (coinDelta !== null) {
				pool.coinReserve = Math.max(1, coinDelta);
				pool.changed('coinReserve', true);
			}
			if (kythDelta !== null) {
				pool.kythReserve = Math.max(0.000001, kythDelta);
				pool.changed('kythReserve', true);
			}

			// Recalculate K after hard set
			pool.kConstant = Number(pool.coinReserve) * Number(pool.kythReserve);
			pool.changed('kConstant', true);
			await pool.save();
			const newPrice = getSpotPrice({
				coinReserve: Number(pool.coinReserve),
				kythReserve: Number(pool.kythReserve),
			});
			const msg = await t(
				interaction,
				'core.commands.utils.kyth.eco.pool.update',
				{
					coin: Number(pool.coinReserve).toLocaleString(),
					kyth: Number(pool.kythReserve).toFixed(4),
					k: pool.kConstant.toLocaleString(),
					price: newPrice.toFixed(4),
				},
			);
			const components = await simpleContainer(interaction, msg, {
				color: 'Green',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		if (action === 'recalculate') {
			const oldK = pool.kConstant;
			pool.kConstant = Number(pool.coinReserve) * Number(pool.kythReserve);
			pool.changed('kConstant', true);
			await pool.save();
			const msg = await t(
				interaction,
				'core.commands.utils.kyth.eco.pool.recalc',
				{
					old: Number(oldK).toLocaleString(),
					new: pool.kConstant.toLocaleString(),
				},
			);
			const components = await simpleContainer(interaction, msg, {
				color: 'Green',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}
exports.default = PoolCommand;
