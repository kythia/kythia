/**
 * @namespace: addons/economy/commands/bank/loan.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { toBigIntSafe } = require('../../helpers/bigint');
const banks = require('../../helpers/banks');
const { BaseCommand } = require('kythia-core');
class LoanCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('loan')
			.setDescription('Borrow money from your bank or repay your loan.')
			.addStringOption((option) =>
				option
					.setName('action')
					.setDescription('Borrow or Repay?')
					.setRequired(true)
					.addChoices(
						{
							name: 'Borrow',
							value: 'borrow',
						},
						{
							name: 'Repay',
							value: 'repay',
						},
					),
			)
			.addIntegerOption((option) =>
				option
					.setName('amount')
					.setDescription('Amount to borrow or repay')
					.setRequired(true),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, models, kythiaConfig, helpers } = container;
		const { KythiaUser } = models;
		const { simpleContainer } = helpers.discord;
		await interaction.deferReply();
		const user = await KythiaUser.getCache({
			userId: interaction.user.id,
		});
		if (!user) {
			const msg = await t(
				interaction,
				'economy.shared.withdraw.no.account.desc',
			);
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
				await t(
					interaction,
					'economy.commands.bank.loan.error.invalid_amount.desc',
				),
				{
					color: 'Red',
				},
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
					await t(
						interaction,
						'economy.commands.bank.loan.borrow.error.active_loan.desc',
						{
							loan: user.activeLoan.toLocaleString(),
						},
					),
					{
						color: 'Red',
					},
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
					await t(
						interaction,
						'economy.commands.bank.loan.borrow.error.max_loan.desc',
						{
							score: user.creditScore,
							max: maxLoan.toLocaleString(),
						},
					),
					{
						color: 'Red',
					},
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
			const msg = await t(
				interaction,
				'economy.commands.bank.loan.borrow.success.desc',
				{
					amount: amount.toLocaleString(),
					rate: interestRate * 100,
					date: Math.floor(dueDate.getTime() / 1000),
				},
			);
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
					await t(
						interaction,
						'economy.commands.bank.loan.repay.error.no_loan.desc',
					),
					{
						color: 'Yellow',
					},
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
					await t(
						interaction,
						'economy.commands.bank.loan.repay.error.insufficient_funds.desc',
						{
							amount: repayAmount.toLocaleString(),
						},
					),
					{
						color: 'Red',
					},
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
				extraMsg = await t(
					interaction,
					'economy.commands.bank.loan.repay.credit_increase',
					{
						increase: creditIncrease,
						score: user.creditScore,
					},
				);
				user.changed('loanDueDate', true);
				user.changed('loanInterest', true);
				user.changed('creditScore', true);
			}
			user.changed('kythiaCoin', true);
			user.changed('activeLoan', true);
			await user.save();
			const msg = await t(
				interaction,
				'economy.commands.bank.loan.repay.success.desc',
				{
					amount: repayAmount.toLocaleString(),
					balance: user.activeLoan.toLocaleString(),
					extra: extraMsg,
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
exports.default = LoanCommand;
