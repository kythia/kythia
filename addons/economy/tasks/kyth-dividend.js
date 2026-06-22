/**
 * @namespace: addons/economy/tasks/kyth-dividend.js
 * @type: Scheduled Task
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Op } = require('sequelize');
const { BaseTask } = require('kythia-core');
class KythDividendTask extends BaseTask {
	task = {
		taskName: 'economy-kyth-dividend',
		schedule: '0 0 * * *',
		active: true,
	};
	async execute(container) {
		const { client, models, logger, t } = container || this.container;
		const { KythLiquidityPool, KythiaUser } = models;
		if (client.shard && !client.shard.ids.includes(0)) return;
		logger.info('Checking KYTH staking dividends...', {
			label: 'economy',
		});
		try {
			const pool = await KythLiquidityPool.getCache(
				{
					id: 1,
				},
				{
					noCache: true,
				},
			);
			if (!pool) {
				logger.warn('KYTH pool not found. Skipping dividend.', {
					label: 'economy',
				});
				return;
			}

			// ── Admin kill switch ─────────────────────────────────────────────
			if (pool.dividendActive === false) {
				logger.info(
					'Dividend distribution is disabled by admin (dividendActive=false). Skipping.',
					{
						label: 'economy',
					},
				);
				return;
			}
			const totalTax = Number(pool.totalTaxCollected);
			if (totalTax <= 0) {
				logger.info(
					'No protocol fees collected today. No dividend to distribute.',
					{
						label: 'economy',
					},
				);
				return;
			}

			// ── Dividend split (admin-configurable) ───────────────────────────
			const splitPct = Number(pool.dividendSplitPct ?? 50) / 100;
			const dividendPool = Math.floor(totalTax * splitPct);
			if (dividendPool <= 0) {
				logger.info(
					`Dividend pool is 0 (splitPct=${(splitPct * 100).toFixed(1)}%, totalTax=${totalTax}). Skipping.`,
					{
						label: 'economy',
					},
				);
				return;
			}
			const stakers = await KythiaUser.getAllCache({
				where: {
					kythStaked: {
						[Op.gt]: 0,
					},
					bankType: 'solara_mutual',
				},
			});
			if (stakers.length === 0) {
				logger.info(
					'No KYTH stakers found. Dividends carried over to next cycle.',
					{
						label: 'economy',
					},
				);
				return;
			}
			const totalStaked = stakers.reduce(
				(sum, u) => sum + (Number(u.kythStaked) || 0),
				0,
			);
			if (totalStaked <= 0) return;
			logger.info(
				`Distributing 🪙 ${dividendPool} Coin (${(splitPct * 100).toFixed(1)}% of ${totalTax}) to ${stakers.length} stakers`,
				{
					label: 'economy',
				},
			);
			for (const staker of stakers) {
				const share = Number(staker.kythStaked) / totalStaked;
				const reward = Math.floor(dividendPool * share);
				if (reward <= 0) continue;
				staker.kythiaCoin = BigInt(staker.kythiaCoin || 0) + BigInt(reward);
				staker.changed('kythiaCoin', true);
				await staker.save();
				try {
					const discordUser =
						await client.container.helpers.discord.getUserSafe(
							client,
							staker.userId,
						);
					await discordUser.send(
						(await t(null, 'economy.tasks.kyth-dividend.dividend.title')) +
							'\n' +
							`You earned **🪙 ${reward.toLocaleString()} Coin** as your daily dividend!\n` +
							`Your stake: **${Number(staker.kythStaked).toFixed(6)} KYTH** (${(share * 100).toFixed(2)}% of pool)\n` +
							`Dividend pool today: **🪙 ${dividendPool.toLocaleString()} Coin**`,
					);
				} catch (_e) {}
			}

			// Reset collected fees
			pool.totalTaxCollected = 0;
			pool.changed('totalTaxCollected', true);
			await pool.save();
			logger.info('KYTH dividend distribution complete.', {
				label: 'economy',
			});
		} catch (error) {
			logger.error(`Error during KYTH dividend: ${error.message || error}`, {
				label: 'economy',
			});
		}
	}
}
exports.default = KythDividendTask;
