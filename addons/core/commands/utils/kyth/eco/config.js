/**
 * @namespace: addons/core/commands/utils/kyth/eco/config.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { formatPoolStats } = require('../../../../../economy/helpers/kyth-amm');

const { BaseCommand } = require('kythia-core');

// Helpers extracted to addons/core/helpers/kyth-eco.js

// CONFIG_PARAMS extracted to addons/core/helpers/kyth-eco.js

class ConfigCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('config')
			.setDescription('⚙️ View and change all KYTH AMM runtime settings.')
			.addStringOption((option) =>
				option
					.setName('param')
					.setDescription('Which setting to change (leave empty to view all)')
					.setRequired(false)
					.addChoices(
						...Object.entries(
							require('../../../../helpers/kyth-eco').CONFIG_PARAMS,
						).map(([key, def]) => ({
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
			);

	async execute(interaction) {
		const container = this.container;
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
		const CONFIG_PARAMS = helpers.core['kyth-eco'].CONFIG_PARAMS;

		// ── View All ───────────────────────────────────────────────────────────
		if (!param) {
			const stats = formatPoolStats(pool);
			const lines = [
				`## ⚙️ KYTH Configuration Panel`,
				`*Current spot price: **${stats.spotPrice} Coin/KYTH** | Pool TVL: **🪙 ${stats.tvl}***`,
				``,
				`### 🛡️ Trading Controls`,
				`**${CONFIG_PARAMS.trading_halt.label}:** ${helpers.core['kyth-eco'].fmtBool(!pool.tradingHalted)}`,
				`**${CONFIG_PARAMS.fee_rate.label}:** ${helpers.core['kyth-eco'].fmtPct(pool.feeRatePct ?? 2)}`,
				`**${CONFIG_PARAMS.min_trade.label}:** 🪙 ${Number(pool.minTradeAmount ?? 1).toLocaleString()}`,
				`**${CONFIG_PARAMS.max_trade.label}:** ${helpers.core['kyth-eco'].fmtCoin(pool.maxTradeAmount ?? 0)}`,
				``,
				`### 🔥 Token Burn`,
				`**${CONFIG_PARAMS.burn_active.label}:** ${helpers.core['kyth-eco'].fmtBool(pool.burnActive ?? true)}`,
				`**${CONFIG_PARAMS.burn_rate.label}:** ${helpers.core['kyth-eco'].fmtPct(pool.burnRatePct ?? 5)} per cycle`,
				`**Last Burn:** ${pool.lastBurnAt ? `<t:${Math.floor(new Date(pool.lastBurnAt).getTime() / 1000)}:R>` : 'Never'}`,
				``,
				`### 💰 Staking & Dividends`,
				`**${CONFIG_PARAMS.dividend_active.label}:** ${helpers.core['kyth-eco'].fmtBool(pool.dividendActive ?? true)}`,
				`**${CONFIG_PARAMS.dividend_split.label}:** ${helpers.core['kyth-eco'].fmtPct(pool.dividendSplitPct ?? 50)} of fees to stakers`,
				`**${CONFIG_PARAMS.staking_active.label}:** ${helpers.core['kyth-eco'].fmtBool(pool.stakingActive ?? true)}`,
				`**${CONFIG_PARAMS.staking_min.label}:** ${Number(pool.stakingMinKyth ?? 1).toFixed(4)} KYTH`,
				``,
				`### 🕶️ Features`,
				`**${CONFIG_PARAMS.blackmarket_active.label}:** ${helpers.core['kyth-eco'].fmtBool(pool.blackmarketActive ?? true)}`,
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
	}
}

exports.default = ConfigCommand;
