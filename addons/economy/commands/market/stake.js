/**
 * @namespace: addons/economy/commands/kyth_stake.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const {
	MessageFlags,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require('discord.js');

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
			const msg = [
				`## 🏦 KYTH Staking Status`,
				`**💎 KYTH in Wallet:** ${userKyth.toFixed(6)}`,
				`**🔒 KYTH Staked:** ${userStaked.toFixed(6)}`,
				``,
				`Staked KYTH earns a share of the daily dividend pool (50% of all protocol fees collected).`,
				user.bankType !== 'solara_mutual'
					? `\n⚠️ You are not using **Solara Mutual** bank. Only Solara Mutual users earn staking dividends!`
					: `✅ You are using **Solara Mutual**. You are eligible for dividends!`,
			].join('\n');
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
				'Please provide a valid KYTH amount.',
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
					'## ⏸️ Staking Paused\nKYTH staking is temporarily disabled by admin. Your existing stake is safe.',
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
					`## ❌ Below Minimum\nYou must stake at least **${minStake.toFixed(4)} KYTH**.`,
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
					'## 🏦 Staking Unavailable\nYou must use **Solara Mutual** bank to stake KYTH for dividends. Switch banks with `/eco bank_switch`!',
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
					`## ❌ Insufficient KYTH\nYou only have **${userKyth.toFixed(6)} KYTH** in your wallet.`,
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

			const msg = `## 🔒 KYTH Staked!\nYou staked **${amount.toFixed(6)} KYTH** with Solara Mutual.\n**Total Staked:** ${user.kythStaked.toFixed(6)} KYTH\nYou will earn a share of daily dividends from protocol fees!`;
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
					`## ❌ Insufficient Staked KYTH\nYou only have **${userStaked.toFixed(6)} KYTH** staked.`,
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

			const msg = `## 🔓 KYTH Unstaked!\nYou unstaked **${amount.toFixed(6)} KYTH** from Solara Mutual.\n**Remaining Staked:** ${user.kythStaked.toFixed(6)} KYTH`;
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
