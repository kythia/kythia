/**
 * @namespace: addons/economy/tasks/token-burn.js
 * @type: Scheduled Task
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { BaseTask } = require('kythia-core');

class TokenBurnTask extends BaseTask {
	task = {
		taskName: 'economy-token-burn',
		schedule: '0 12 1 * *',
		active: true,
	};

	async execute(container) {
		const { client, models, logger, kythiaConfig } =
			container || this.container;
		const { KythLiquidityPool } = models;

		if (client.shard && !client.shard.ids.includes(0)) return;

		logger.info('Checking monthly KYTH Token Burn...', { label: 'economy' });

		try {
			const pool = await KythLiquidityPool.getCache(
				{ id: 1 },
				{ noCache: true },
			);
			if (!pool) {
				logger.warn('KYTH pool not found. Skipping token burn.', {
					label: 'economy',
				});
				return;
			}

			// ── Admin kill switch ─────────────────────────────────────────────
			if (pool.burnActive === false) {
				logger.info(
					'Token burn is disabled by admin (burnActive=false). Skipping.',
					{ label: 'economy' },
				);
				return;
			}

			const burnRatePct = Number(pool.burnRatePct ?? 5) / 100;
			const oldKythReserve = Number(pool.kythReserve);
			const burnAmount = oldKythReserve * burnRatePct;
			const newKythReserve = oldKythReserve - burnAmount;
			const oldPrice = Number(pool.coinReserve) / oldKythReserve;
			const newK = Number(pool.coinReserve) * newKythReserve;
			const newPrice = Number(pool.coinReserve) / newKythReserve;
			const priceIncreasePct = (
				((newPrice - oldPrice) / oldPrice) *
				100
			).toFixed(2);

			pool.kythReserve = newKythReserve;
			pool.kConstant = newK;
			pool.lastBurnAt = new Date();
			pool.changed('kythReserve', true);
			pool.changed('kConstant', true);
			pool.changed('lastBurnAt', true);
			await pool.save();

			logger.info(
				`Token Burn Complete. Burned: ${burnAmount.toFixed(6)} KYTH (${(burnRatePct * 100).toFixed(2)}%). Price: ${oldPrice.toFixed(6)} → ${newPrice.toFixed(6)} (+${priceIncreasePct}%)`,
				{ label: 'economy' },
			);

			try {
				const announceChannelId =
					kythiaConfig?.addons?.economy?.kythAnnounceChannelId;
				if (announceChannelId) {
					const announcement = [
						`# 🔥 KYTH TOKEN BURN EVENT`,
						`The Kythia Central Bank has executed the scheduled KYTH burn!`,
						``,
						`**🔥 KYTH Burned:** ${burnAmount.toFixed(6)} KYTH (${(burnRatePct * 100).toFixed(1)}% of reserves)`,
						`**📈 Price Impact:** +${priceIncreasePct}%`,
						`**💎 New Price:** ${newPrice.toFixed(6)} Coin/KYTH`,
						``,
						`Existing KYTH holders just got richer. 🚀 Diamond hands always win.`,
					].join('\n');

					if (client.shard) {
						await client.shard.broadcastEval(
							async (c, { channelId, msg }) => {
								const ch =
									await c.container.helpers.discord.getChannelGlobalSafe(
										c,
										channelId,
									);
								if (ch) await ch.send(msg);
							},
							{ context: { channelId: announceChannelId, msg: announcement } },
						);
					} else {
						const ch = await container.helpers.discord.getChannelGlobalSafe(
							client,
							announceChannelId,
						);
						if (ch) await ch.send(announcement);
					}
				}
			} catch (announceErr) {
				logger.warn(
					`Could not broadcast burn announcement: ${announceErr.message}`,
					{ label: 'economy' },
				);
			}
		} catch (error) {
			logger.error(`Error during KYTH token burn: ${error.message || error}`, {
				label: 'economy',
			});
		}
	}
}

exports.default = TokenBurnTask;
