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

/**
 * Broadcasts a message to the configured KYTH announcement channel.
 */
async function broadcastToGuilds(
	client,
	kythiaConfig,
	overrideChannelId,
	text,
) {
	const targetChannelId =
		overrideChannelId || kythiaConfig?.addons?.economy?.kythAnnounceChannelId;
	if (!targetChannelId) return;

	try {
		if (client.shard) {
			await client.shard.broadcastEval(
				async (c, { channelId, msg }) => {
					const ch = await c.container.helpers.discord.getChannelGlobalSafe(
						c,
						channelId,
					);
					if (ch) await ch.send(msg);
				},
				{ context: { channelId: targetChannelId, msg: text } },
			);
		} else {
			const ch = await client.container.helpers.discord.getChannelGlobalSafe(
				client,
				targetChannelId,
			);
			if (ch) await ch.send(text);
		}
	} catch (_e) {}
}

module.exports = {
	CONFIG_PARAMS,
	fmtBool,
	fmtPct,
	fmtCoin,
	broadcastToGuilds,
};
