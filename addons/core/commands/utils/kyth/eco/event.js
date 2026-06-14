/**
 * @namespace: addons/core/commands/utils/kyth/eco/event.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const {
	getSpotPrice,
	calcSellOutput,
	calcBuyOutput,
	formatPoolStats,
} = require('../../../../../economy/helpers/kyth-amm');

const { BaseCommand } = require('kythia-core');

class EventCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('event')
			.setDescription('🌪️ Trigger KYTH market shock events.')
			.addStringOption((option) =>
				option
					.setName('type')
					.setDescription('Which event to trigger?')
					.setRequired(true)
					.addChoices(
						{
							name: 'Whale Dump — NPC sells large KYTH to pool',
							value: 'whale_dump',
						},
						{
							name: 'Token Burn — Immediately burn 5% of pool KYTH',
							value: 'token_burn',
						},
						{
							name: 'Bull Run — Inject coin to simulate buying pressure',
							value: 'bull_run',
						},
						{
							name: 'Announce — Broadcast custom market news to all guilds',
							value: 'announce',
						},
					),
			)
			.addNumberOption((option) =>
				option
					.setName('amount')
					.setDescription(
						'[whale_dump] KYTH to sell | [bull_run] Coin to pump | [token_burn] Burn % (default 5)',
					)
					.setRequired(false),
			)
			.addStringOption((option) =>
				option
					.setName('message')
					.setDescription('[announce] The announcement message')
					.setRequired(false),
			)
			.addStringOption((option) =>
				option
					.setName('channel_id')
					.setDescription(
						'[announce] Channel ID to broadcast to (leave blank to use config)',
					)
					.setRequired(false),
			);

	async execute(interaction) {
		const container = this.container;
		const { models, kythiaConfig, helpers } = container;
		const { KythLiquidityPool } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const type = interaction.options.getString('type');
		const amount = interaction.options.getNumber('amount');
		const message = interaction.options.getString('message');
		const channelId = interaction.options.getString('channel_id');

		const pool = await KythLiquidityPool.getCache({ id: 1 }, { noCache: true });
		if (!pool && type !== 'announce') {
			const components = await simpleContainer(
				interaction,
				'## ❌ Pool Not Found\nThe KYTH liquidity pool has not been initialized.',
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		// ─── Whale Dump ───────────────────────────────────────────────────────────
		if (type === 'whale_dump') {
			const kythToSell = amount || 500; // Default: NPC dumps 500 KYTH

			const result = calcSellOutput(kythToSell, {
				coinReserve: Number(pool.coinReserve),
				kythReserve: Number(pool.kythReserve),
				kConstant: Number(pool.kConstant),
			});

			const oldPrice = getSpotPrice({
				coinReserve: Number(pool.coinReserve),
				kythReserve: Number(pool.kythReserve),
			});

			// NPC sells into pool — pool gains KYTH, loses Coin
			// We use calcSellOutput (fee is waived for NPC — it's a synthetic event)
			pool.coinReserve = result.newCoinReserve;
			pool.kythReserve = result.newKythReserve;
			pool.changed('coinReserve', true);
			pool.changed('kythReserve', true);
			await pool.save();

			const newPrice = getSpotPrice({
				coinReserve: Number(pool.coinReserve),
				kythReserve: Number(pool.kythReserve),
			});
			const priceDrop = (((newPrice - oldPrice) / oldPrice) * 100).toFixed(2);

			const announcement = [
				`# 🐳 WHALE DUMP ALERT!`,
				`An unknown entity just dumped **${kythToSell.toLocaleString()} KYTH** onto the market!`,
				``,
				`**📉 Price Crash:** ${priceDrop}%`,
				`**Old Price:** ${oldPrice.toFixed(4)} Coin/KYTH`,
				`**New Price:** ${newPrice.toFixed(4)} Coin/KYTH`,
				``,
				`**Serok bawah sekarang!** Use \`/eco market buy kyth\` to buy the dip! 🛒`,
			].join('\n');

			await helpers.core['kyth-eco'].broadcastToGuilds(
				interaction.client,
				kythiaConfig,
				channelId,
				announcement,
			);

			const msg = `## ✅ Whale Dump Executed\n**${kythToSell} KYTH** dumped by NPC.\nPrice: ${oldPrice.toFixed(4)} → ${newPrice.toFixed(4)} (${priceDrop}%)`;
			const components = await simpleContainer(interaction, msg, {
				color: 'Yellow',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		// ─── Token Burn ───────────────────────────────────────────────────────────
		if (type === 'token_burn') {
			const burnPct =
				amount && amount > 0 && amount <= 50 ? amount / 100 : 0.05;
			const oldKyth = Number(pool.kythReserve);
			const burnAmount = oldKyth * burnPct;
			const newKyth = oldKyth - burnAmount;
			const oldPrice = getSpotPrice({
				coinReserve: Number(pool.coinReserve),
				kythReserve: oldKyth,
			});
			const newK = Number(pool.coinReserve) * newKyth; // K recalculated → price jump
			const newPrice = Number(pool.coinReserve) / newKyth;

			pool.kythReserve = newKyth;
			pool.kConstant = newK;
			pool.lastBurnAt = new Date();
			pool.changed('kythReserve', true);
			pool.changed('kConstant', true);
			pool.changed('lastBurnAt', true);
			await pool.save();

			const priceIncrease = (((newPrice - oldPrice) / oldPrice) * 100).toFixed(
				2,
			);

			const announcement = [
				`# 🔥 KYTH TOKEN BURN!`,
				`The Kythia Central Bank has burned **${burnAmount.toFixed(4)} KYTH** from the liquidity pool!`,
				``,
				`**📈 Price Jump:** +${priceIncrease}%`,
				`**Old Price:** ${oldPrice.toFixed(4)} Coin/KYTH`,
				`**New Price:** ${newPrice.toFixed(4)} Coin/KYTH`,
				``,
				`Existing KYTH holders just got richer. 🚀 Diamond hands win!`,
			].join('\n');

			await helpers.core['kyth-eco'].broadcastToGuilds(
				interaction.client,
				kythiaConfig,
				channelId,
				announcement,
			);

			const msg = `## ✅ Token Burn Executed\nBurned: ${burnAmount.toFixed(4)} KYTH\nPrice: ${oldPrice.toFixed(4)} → ${newPrice.toFixed(4)} (+${priceIncrease}%)`;
			const components = await simpleContainer(interaction, msg, {
				color: 'Green',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		// ─── Bull Run ─────────────────────────────────────────────────────────────
		if (type === 'bull_run') {
			const coinToInject = amount || 200_000;
			const oldPrice = getSpotPrice({
				coinReserve: Number(pool.coinReserve),
				kythReserve: Number(pool.kythReserve),
			});

			// NPC buys KYTH using calcBuyOutput — correctly moves reserves
			// Fee is waived (synthetic event, no real coin entering from user)
			const ammResult = calcBuyOutput(coinToInject, {
				coinReserve: Number(pool.coinReserve),
				kythReserve: Number(pool.kythReserve),
				kConstant: Number(pool.kConstant),
			});

			// The KYTH that leaves pool via NPC buy is simply burned (no real recipient)
			pool.coinReserve = ammResult.newCoinReserve; // precision-safe, no Math.round
			pool.kythReserve = ammResult.newKythReserve;
			pool.changed('coinReserve', true);
			pool.changed('kythReserve', true);
			await pool.save();

			const newPrice = getSpotPrice({
				coinReserve: Number(pool.coinReserve),
				kythReserve: Number(pool.kythReserve),
			});
			const priceIncrease = (((newPrice - oldPrice) / oldPrice) * 100).toFixed(
				2,
			);

			const stats = formatPoolStats(pool);

			const announcement = [
				`# 🚀 BULL RUN INCOMING!`,
				`A mysterious buyer just pumped **🪙 ${coinToInject.toLocaleString()} Coin** into the KYTH pool!`,
				``,
				`**📈 Price Surge:** +${priceIncrease}%`,
				`**Old Price:** ${oldPrice.toFixed(6)} Coin/KYTH`,
				`**New Price:** ${newPrice.toFixed(6)} Coin/KYTH`,
				`**Market Cap:** 🪙 ${stats.marketCap}`,
				``,
				`**FOMO alert!** Use \`/eco market buy kyth\` before it goes even higher! 💎`,
			].join('\n');

			await helpers.core['kyth-eco'].broadcastToGuilds(
				interaction.client,
				kythiaConfig,
				channelId,
				announcement,
			);

			const msg = `## ✅ Bull Run Triggered\nInjected: 🪙 ${coinToInject.toLocaleString()} Coin\nPrice: ${oldPrice.toFixed(6)} → ${newPrice.toFixed(6)} (+${priceIncrease}%)`;
			const components = await simpleContainer(interaction, msg, {
				color: 'Green',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		// ─── Custom Announce ──────────────────────────────────────────────────────
		if (type === 'announce') {
			if (!message) {
				const components = await simpleContainer(
					interaction,
					'You must provide a `message` for the announcement.',
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			await helpers.core['kyth-eco'].broadcastToGuilds(
				interaction.client,
				kythiaConfig,
				channelId,
				`## 📢 KYTH Market Update\n${message}`,
			);

			const components = await simpleContainer(
				interaction,
				'✅ Announcement broadcast successfully.',
				{ color: 'Green' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}

exports.default = EventCommand;
