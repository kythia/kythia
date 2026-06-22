/**
 * @namespace: addons/economy/commands/bank/deposit.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const banks = require('../../helpers/banks');
const { toBigIntSafe } = require('../../helpers/bigint');
const { BaseCommand } = require('kythia-core');
class DepositCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('deposit')
			.setDescription('Deposit your kythia coin into kythia bank.')
			.addStringOption((option) =>
				option
					.setName('type')
					.setDescription('Choose deposit type: all or partial')
					.setRequired(true)
					.addChoices(
						{
							name: 'Deposit All',
							value: 'all',
						},
						{
							name: 'Deposit Partial',
							value: 'partial',
						},
					),
			)
			.addIntegerOption((option) =>
				option
					.setName('amount')
					.setDescription('Amount to deposit')
					.setRequired(false)
					.setMinValue(1),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, models, kythiaConfig, helpers } = container;
		const { KythiaUser } = models;
		const { simpleContainer } = helpers.discord;
		await interaction.deferReply();
		const type = interaction.options.getString('type');
		let amount = interaction.options.getInteger('amount');
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
		if (type === 'all') {
			amount = user.kythiaCoin;
		} else if (type === 'partial') {
			if (amount === null) {
				const msg = await t(
					interaction,
					'economy.commands.bank.deposit.deposit.amount.required',
				);
				const components = await simpleContainer(interaction, msg, {
					color: 'Yellow',
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		}
		if (amount <= 0) {
			const msg = await t(
				interaction,
				'economy.commands.bank.deposit.deposit.invalid.amount',
			);
			const components = await simpleContainer(interaction, msg, {
				color: 'Yellow',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		if (user.kythiaCoin < amount) {
			const msg = await t(
				interaction,
				'economy.commands.bank.deposit.deposit.not.enough.cash',
			);
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		if (amount === 0) {
			const msg = await t(
				interaction,
				'economy.commands.bank.deposit.deposit.zero.cash',
			);
			const components = await simpleContainer(interaction, msg, {
				color: 'Yellow',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const userBank = banks.getBank(user.bankType);
		const maxBalance =
			userBank.maxBalance === Infinity
				? Infinity
				: userBank.maxBalance + (user.extraBankCapacity || 0);
		if (user.kythiaBank + amount > maxBalance) {
			const msg = await t(
				interaction,
				'economy.commands.bank.deposit.deposit.max.balance',
				{
					max: maxBalance.toLocaleString(),
				},
			);
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		user.kythiaCoin = toBigIntSafe(user.kythiaCoin) - toBigIntSafe(amount);
		user.kythiaBank = toBigIntSafe(user.kythiaBank) + toBigIntSafe(amount);
		user.changed('kythiaCoin', true);
		user.changed('kythiaBank', true);
		await user.save();
		const msg = await t(
			interaction,
			'economy.commands.bank.deposit.deposit.success',
			{
				amount,
			},
		);
		const components = await simpleContainer(interaction, msg, {
			color: kythiaConfig.bot.color,
		});
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
exports.default = DepositCommand;
