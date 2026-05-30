/**
 * @namespace: addons/economy/commands/loan.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const {
	MessageFlags,
	ContainerBuilder,
	TextDisplayBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	SeparatorBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
const { toBigIntSafe } = require('../../helpers/bigint');
const banks = require('../../helpers/banks');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('loan')
			.setDescription('🏦 Borrow money from your bank or repay your loan.')
			.addStringOption((option) =>
				option
					.setName('action')
					.setDescription('Borrow or Repay?')
					.setRequired(true)
					.addChoices(
						{ name: 'Borrow', value: 'borrow' },
						{ name: 'Repay', value: 'repay' },
					),
			)
			.addIntegerOption((option) =>
				option
					.setName('amount')
					.setDescription('Amount to borrow or repay')
					.setRequired(true),
			),

	async execute(interaction, container) {
		const { t, models, kythiaConfig, helpers } = container;
		const { KythiaUser } = models;
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
		const amount = interaction.options.getInteger('amount');

		if (amount <= 0) {
			const components = await simpleContainer(
				interaction,
				'Amount must be greater than 0.',
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		user.activeLoan = toBigIntSafe(user.activeLoan || 0);
		user.creditScore = user.creditScore || 300;

		if (action === 'borrow') {
			if (user.activeLoan > 0) {
				const components = await simpleContainer(
					interaction,
					`## 🏦 Loan Denied\nYou already have an active loan of **🪙 ${user.activeLoan.toLocaleString()}**. You must repay it first.`,
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			const maxLoan = user.creditScore * 1000;
			if (amount > maxLoan) {
				const components = await simpleContainer(
					interaction,
					`## 🏦 Loan Denied\nYour credit score (${user.creditScore}) only allows you to borrow up to **🪙 ${maxLoan.toLocaleString()}**.`,
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			const bank = banks.getBank(user.bankType || 'solara_mutual');
			const interestRate = bank.id === 'solara_mutual' ? 0.03 : 0.05;

			user.activeLoan = toBigIntSafe(amount);
			user.loanInterest = interestRate;

			const dueDate = new Date();
			dueDate.setDate(dueDate.getDate() + 7);
			user.loanDueDate = dueDate;

			user.kythiaCoin = toBigIntSafe(user.kythiaCoin) + toBigIntSafe(amount);

			user.changed('activeLoan', true);
			user.changed('loanInterest', true);
			user.changed('loanDueDate', true);
			user.changed('kythiaCoin', true);
			await user.save();

			const msg = `## 🏦 Loan Approved!\nYou have borrowed **🪙 ${amount.toLocaleString()}** at a daily interest rate of ${interestRate * 100}%.\nYou must repay it before <t:${Math.floor(dueDate.getTime() / 1000)}:f> or your assets will be seized!`;
			const components = await simpleContainer(interaction, msg, {
				color: 'Green',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} else if (action === 'repay') {
			if (user.activeLoan <= 0) {
				const components = await simpleContainer(
					interaction,
					`You don't have an active loan to repay.`,
					{ color: 'Yellow' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			const totalOwed = Number(user.activeLoan);
			const repayAmount = Math.min(amount, totalOwed);

			user.kythiaCoin =
				typeof user.kythiaCoin === 'bigint'
					? Number(user.kythiaCoin)
					: parseInt(user.kythiaCoin, 10);
			if (user.kythiaCoin < repayAmount) {
				const components = await simpleContainer(
					interaction,
					`You don't have enough cash (**🪙 ${repayAmount.toLocaleString()}**) to make this repayment.`,
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			user.kythiaCoin = toBigIntSafe(user.kythiaCoin - repayAmount);
			user.activeLoan = toBigIntSafe(totalOwed - repayAmount);

			let extraMsg = '';
			if (user.activeLoan <= 0) {
				user.activeLoan = 0;
				user.loanDueDate = null;
				user.loanInterest = 0;

				const creditIncrease = Math.floor(Math.random() * 20) + 10;
				user.creditScore += creditIncrease;
				if (user.creditScore > 850) user.creditScore = 850;

				extraMsg = `\n\n📈 Loan fully repaid! Your Credit Score increased by **${creditIncrease}** (Now: ${user.creditScore})!`;

				user.changed('loanDueDate', true);
				user.changed('loanInterest', true);
				user.changed('creditScore', true);
			}

			user.changed('kythiaCoin', true);
			user.changed('activeLoan', true);
			await user.save();

			const msg = `## 🏦 Loan Repayment\nYou repaid **🪙 ${repayAmount.toLocaleString()}**. Remaining balance: **🪙 ${user.activeLoan.toLocaleString()}**.${extraMsg}`;
			const components = await simpleContainer(interaction, msg, {
				color: 'Green',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	},
};
