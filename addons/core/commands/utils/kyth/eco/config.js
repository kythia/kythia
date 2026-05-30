/**
 * @namespace: addons/core/commands/utils/kyth/config.js
 * @type: Admin Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0
 *
 * Full admin control panel for the KYTH AMM economy.
 * Every automated behavior can be toggled, tuned, or paused from here.
 * No redeploy needed — all settings live in the DB.
 */

const { MessageFlags } = require('discord.js');
const { formatPoolStats } = require('../../../../../economy/helpers/kyth-amm');

// ── Human-readable config display ─────────────────────────────────────────────
function fmtBool(val) {
	return val ? '✅ Active' : '⏸️ Paused';
}
function fmtPct(val) {
	return `${Number(val).toFixed(2)}%`;
}
function fmtCoin(val) {
	const n = Number(val);
	return n === 0 ? 'Unlimited' : `🪙 ${n.toLocaleString()}`;
}

// ── Config param definitions ───────────────────────────────────────────────────
const CONFIG_PARAMS = {
	// Format: key → { column, type, label, validate(v), desc }
	trading_halt: {
		column: 'tradingHalted',
		type: 'bool',
		label: '🚫 Trading Halt',
		desc: 'Emergency kill switch. Halts ALL KYTH buy/sell.',
	},
	fee_rate: {
		column: 'feeRatePct',
		type: 'float',
		label: '💸 Protocol Fee',
		desc: 'Fee % taken per swap (e.g. 2 = 2%). Range: 0–10.',
		validate: (v) => v >= 0 && v <= 10,
	},
	min_trade: {
		column: 'minTradeAmount',
		type: 'float',
		label: '📉 Min Trade',
		desc: 'Minimum Coin per buy order. Range: 1+.',
		validate: (v) => v >= 1,
	},
	max_trade: {
		column: 'maxTradeAmount',
		type: 'float',
		label: '📈 Max Trade',
		desc: 'Max Coin per buy order (0 = unlimited). Useful to prevent whales.',
		validate: (v) => v >= 0,
	},
	burn_active: {
		column: 'burnActive',
		type: 'bool',
		label: '🔥 Auto Token Burn',
		desc: 'Monthly scheduled token burn (burns burnRatePct of pool).',
	},
	burn_rate: {
		column: 'burnRatePct',
		type: 'float',
		label: '🔥 Burn Rate',
		desc: '% of kythReserve burned each cycle. Range: 0.1–50.',
		validate: (v) => v >= 0.1 && v <= 50,
	},
	dividend_active: {
		column: 'dividendActive',
		type: 'bool',
		label: '💰 Auto Dividend',
		desc: 'Daily staking dividend distribution to Solara Mutual stakers.',
	},
	dividend_split: {
		column: 'dividendSplitPct',
		type: 'float',
		label: '💰 Dividend Split',
		desc: '% of fees distributed to stakers (rest stays in pool). Range: 0–100.',
		validate: (v) => v >= 0 && v <= 100,
	},
	blackmarket_active: {
		column: 'blackmarketActive',
		type: 'bool',
		label: '🕶️ Black Market',
		desc: 'Opens/closes /eco blackmarket for all users.',
	},
	staking_active: {
		column: 'stakingActive',
		type: 'bool',
		label: '🔒 Staking',
		desc: 'Enables/disables /eco kyth_stake for all users.',
	},
	staking_min: {
		column: 'stakingMinKyth',
		type: 'float',
		label: '🔒 Min Stake',
		desc: 'Minimum KYTH required to stake. Range: 0+.',
		validate: (v) => v >= 0,
	},
};

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('config')
			.setDescription('⚙️ View and change all KYTH AMM runtime settings.')
			.addStringOption((option) =>
				option
					.setName('param')
					.setDescription('Which setting to change (leave empty to view all)')
					.setRequired(false)
					.addChoices(
						...Object.entries(CONFIG_PARAMS).map(([key, def]) => ({
							name: `${def.label} — ${def.desc.substring(0, 60)}`,
							value: key,
						})),
					),
			)
			.addStringOption((option) =>
				option
					.setName('value')
					.setDescription(
						'New value: use "true"/"false" for toggles, a number for numeric params',
					)
					.setRequired(false),
			),

	async execute(interaction, container) {
		const { models, kythiaConfig, helpers } = container;
		const { KythLiquidityPool } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const pool = await KythLiquidityPool.getCache({ id: 1 }, { noCache: true });
		if (!pool) {
			const components = await simpleContainer(
				interaction,
				'## ❌ Pool Not Found\nRun the database migration first.',
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const param = interaction.options.getString('param');
		const rawValue = interaction.options.getString('value');

		// ── View All ───────────────────────────────────────────────────────────
		if (!param) {
			const stats = formatPoolStats(pool);
			const lines = [
				`## ⚙️ KYTH Configuration Panel`,
				`*Current spot price: **${stats.spotPrice} Coin/KYTH** | Pool TVL: **🪙 ${stats.tvl}***`,
				``,
				`### 🛡️ Trading Controls`,
				`**${CONFIG_PARAMS.trading_halt.label}:** ${fmtBool(!pool.tradingHalted)}`,
				`**${CONFIG_PARAMS.fee_rate.label}:** ${fmtPct(pool.feeRatePct ?? 2)}`,
				`**${CONFIG_PARAMS.min_trade.label}:** 🪙 ${Number(pool.minTradeAmount ?? 1).toLocaleString()}`,
				`**${CONFIG_PARAMS.max_trade.label}:** ${fmtCoin(pool.maxTradeAmount ?? 0)}`,
				``,
				`### 🔥 Token Burn`,
				`**${CONFIG_PARAMS.burn_active.label}:** ${fmtBool(pool.burnActive ?? true)}`,
				`**${CONFIG_PARAMS.burn_rate.label}:** ${fmtPct(pool.burnRatePct ?? 5)} per cycle`,
				`**Last Burn:** ${pool.lastBurnAt ? `<t:${Math.floor(new Date(pool.lastBurnAt).getTime() / 1000)}:R>` : 'Never'}`,
				``,
				`### 💰 Staking & Dividends`,
				`**${CONFIG_PARAMS.dividend_active.label}:** ${fmtBool(pool.dividendActive ?? true)}`,
				`**${CONFIG_PARAMS.dividend_split.label}:** ${fmtPct(pool.dividendSplitPct ?? 50)} of fees to stakers`,
				`**${CONFIG_PARAMS.staking_active.label}:** ${fmtBool(pool.stakingActive ?? true)}`,
				`**${CONFIG_PARAMS.staking_min.label}:** ${Number(pool.stakingMinKyth ?? 1).toFixed(4)} KYTH`,
				``,
				`### 🕶️ Features`,
				`**${CONFIG_PARAMS.blackmarket_active.label}:** ${fmtBool(pool.blackmarketActive ?? true)}`,
				``,
				`---`,
				`*Use \`/kyth config param:<setting> value:<new value>\` to change any setting.*`,
				`*Use \`/kyth pool status\` for pool reserve data.*`,
			];

			const components = await simpleContainer(interaction, lines.join('\n'), {
				color: kythiaConfig.bot.color,
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		// ── Set a Value ────────────────────────────────────────────────────────
		if (!rawValue) {
			const def = CONFIG_PARAMS[param];
			const currentRaw = pool[def.column];
			const currentDisplay =
				def.type === 'bool'
					? fmtBool(
							!currentRaw && def.column === 'tradingHalted' ? true : currentRaw,
						)
					: currentRaw;
			const components = await simpleContainer(
				interaction,
				`**${def.label}**\n*${def.desc}*\n\nCurrent value: \`${currentRaw}\`\n\nProvide a \`value\` to change it.`,
				{ color: kythiaConfig.bot.color },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const def = CONFIG_PARAMS[param];
		let parsedValue;

		if (def.type === 'bool') {
			if (
				!['true', 'false', '1', '0', 'on', 'off'].includes(
					rawValue.toLowerCase(),
				)
			) {
				const components = await simpleContainer(
					interaction,
					`**${def.label}** expects a boolean: \`true\` or \`false\`.`,
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			parsedValue = ['true', '1', 'on'].includes(rawValue.toLowerCase());
		} else {
			parsedValue = parseFloat(rawValue);
			if (Number.isNaN(parsedValue)) {
				const components = await simpleContainer(
					interaction,
					`**${def.label}** expects a number (got: \`${rawValue}\`).`,
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			if (def.validate && !def.validate(parsedValue)) {
				const components = await simpleContainer(
					interaction,
					`**${def.label}**: value \`${parsedValue}\` is out of allowed range.\n*${def.desc}*`,
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		}

		const oldValue = pool[def.column];
		pool[def.column] = parsedValue;
		pool.changed(def.column, true);
		await pool.save();

		// Special display for trading halt (inverted logic for user readability)
		let newDisplay =
			def.type === 'bool'
				? parsedValue
					? '✅ Enabled'
					: '⏸️ Disabled'
				: `\`${parsedValue}\``;
		if (param === 'trading_halt') {
			newDisplay = parsedValue
				? '🚫 HALTED — All KYTH trading is now STOPPED.'
				: '✅ RESUMED — Trading is now active.';
		}

		const components = await simpleContainer(
			interaction,
			[
				`## ✅ Config Updated`,
				``,
				`**Setting:** ${def.label}`,
				`**Old Value:** \`${oldValue ?? 'not set'}\``,
				`**New Value:** ${newDisplay}`,
				``,
				`*Change is effective immediately — no restart needed.*`,
			].join('\n'),
			{ color: 'Green' },
		);
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
