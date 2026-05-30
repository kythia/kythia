/**
 * @namespace: addons/economy/commands/kyth_stake.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('stake')
			.setDescription(
				'🏦 Stake or unstake KYTH tokens with Solara Mutual for daily dividends.',
			)
			.addStringOption((option) =>
				option
					.setName('action')
					.setDescription('Stake or Unstake?')
					.setRequired(true)
					.addChoices(
						{ name: 'Stake KYTH', value: 'stake' },
						{ name: 'Unstake KYTH', value: 'unstake' },
						{ name: 'View Status', value: 'status' },
					),
			)
			.addNumberOption((option) =>
				option
					.setName('amount')
					.setDescription(
						'Amount of KYTH to stake/unstake (not needed for status)',
					)
					.setRequired(false)
					.setMinValue(0.000001),
			),

	async execute(interaction, container) {
		const { t, models, kythiaConfig, helpers } = container;
		const { KythiaUser, KythLiquidityPool } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const user = await KythiaUser.getCache({ userId: interaction.user.id });
		if (!user) {
			const msg = await t(interaction, 'economy.withdraw.no.account.desc');
			const components = await simpleContainer(interaction, msg, {
				color: kythiaConfig.bot.color,
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const action = interaction.options.getString('action');
		const amount = interaction.options.getNumber('amount');

		const userKyth = Number(user.kythHolding) || 0;
		const userStaked = Number(user.kythStaked) || 0;

		if (action === 'status') {
			const bankStatusStr =
				user.bankType !== 'solara_mutual'
					? '\n⚠️ You are not using **Solara Mutual** bank. Only Solara Mutual users earn staking dividends!'
					: '✅ You are using **Solara Mutual**. You are eligible for dividends!';
			const msg = await t(interaction, 'economy.market.stake.status.desc', {
				wallet: userKyth.toFixed(6),
				staked: userStaked.toFixed(6),
				bankStatus: bankStatusStr,
			});
			const components = await simpleContainer(interaction, msg, {
				color: kythiaConfig.bot.color,
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		if (!amount || amount <= 0) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'economy.market.stake.error.invalid_amount.desc'),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		if (action === 'stake') {
			// ── Admin: Staking kill switch ────────────────────────────────────────
			const pool = await KythLiquidityPool.getCache(
				{ id: 1 },
				{ noCache: true },
			);
			if (pool && pool.stakingActive === false) {
				const components = await simpleContainer(
					interaction,
					await t(interaction, 'economy.market.stake.error.paused.desc'),
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			// ── Admin: Minimum stake amount ──────────────────────────────────
			const minStake = Number(pool?.stakingMinKyth ?? 1);
			if (amount < minStake) {
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'economy.market.stake.error.below_minimum.desc',
						{ minStake: minStake.toFixed(4) },
					),
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			if (user.bankType !== 'solara_mutual') {
				const components = await simpleContainer(
					interaction,
					await t(interaction, 'economy.market.stake.error.wrong_bank.desc'),
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			if (userKyth < amount) {
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'economy.market.stake.error.insufficient_kyth.desc',
						{ balance: userKyth.toFixed(6) },
					),
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			user.kythHolding = Math.max(0, userKyth - amount);
			user.kythStaked = userStaked + amount;
			user.changed('kythHolding', true);
			user.changed('kythStaked', true);
			await user.save();

			const msg = await t(interaction, 'economy.market.stake.success.desc', {
				amount: amount.toFixed(6),
				totalStaked: user.kythStaked.toFixed(6),
			});
			const components = await simpleContainer(interaction, msg, {
				color: 'Green',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		if (action === 'unstake') {
			if (userStaked < amount) {
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'economy.market.stake.error.insufficient_staked.desc',
						{ balance: userStaked.toFixed(6) },
					),
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			user.kythStaked = Math.max(0, userStaked - amount);
			user.kythHolding = userKyth + amount;
			user.changed('kythHolding', true);
			user.changed('kythStaked', true);
			await user.save();

			const msg = await t(
				interaction,
				'economy.market.stake.unstake_success.desc',
				{ amount: amount.toFixed(6), totalStaked: user.kythStaked.toFixed(6) },
			);
			const components = await simpleContainer(interaction, msg, {
				color: 'Yellow',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	},
};
