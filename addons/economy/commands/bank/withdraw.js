/**
 * @namespace: addons/economy/commands/bank/withdraw.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const banks = require('../../helpers/banks');
const { toBigIntSafe } = require('../../helpers/bigint');

const { BaseCommand } = require('kythia-core');

class WithdrawCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('withdraw')
			.setDescription('Withdraw your kythia coin from kythia bank.')
			.addIntegerOption((option) =>
				option
					.setName('amount')
					.setDescription('Amount to withdraw')
					.setRequired(true),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, models, kythiaConfig, helpers, logger } = container;
		const { KythiaUser } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();
		try {
			const amount = interaction.options.getInteger('amount');
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

			const userBank = banks.getBank(user.bankType);
			const withdrawFeePercent = userBank.withdrawFeePercent;
			const fee = Math.floor(amount * (withdrawFeePercent / 100));
			const totalRequired = amount + fee;

			if (user.kythiaBank < totalRequired) {
				const msg = await t(
					interaction,
					'economy.withdraw.withdraw.not.enough.bank',
				);
				const components = await simpleContainer(interaction, msg, {
					color: 'Red',
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			user.kythiaBank =
				toBigIntSafe(user.kythiaBank) - toBigIntSafe(totalRequired);
			user.kythiaCoin = toBigIntSafe(user.kythiaCoin) + toBigIntSafe(amount);

			user.changed('kythiaBank', true);
			user.changed('kythiaCoin', true);

			await user.save();

			const msg = await t(interaction, 'economy.withdraw.withdraw.success', {
				user: interaction.user.username,
				amount,
			});
			const components = await simpleContainer(interaction, msg, {
				color: kythiaConfig.bot.color,
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			logger.error(
				`Error during withdraw command execution: ${error.message || error}`,
				{
					label: 'economy:withdraw',
				},
			);
			const msg = await t(interaction, 'economy.withdraw.withdraw.error');
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}

exports.default = WithdrawCommand;
