/**
 * @namespace: addons/economy/commands/account/edit.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags } = require('discord.js');
const banks = require('../../helpers/banks');

const { BaseCommand } = require('kythia-core');

class EditCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('edit')
			.setDescription('👤 Edit your account and choose a bank type.')
			.addStringOption((option) =>
				option
					.setName('bank')
					.setDescription(
						'Each bank offers unique benefits for your playstyle!',
					)
					.setRequired(true)
					.addChoices(
						...banks.getAllBanks().map((bank) => ({
							name: `${bank.emoji} ${bank.name}`,
							value: bank.id,
						})),
					),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, models, kythiaConfig, helpers, logger } = container;
		const { KythiaUser } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();
		try {
			const bankType = interaction.options.getString('bank');
			const userId = interaction.user.id;
			const userBank = banks.getBank(bankType);
			const bankDisplay = `${userBank.emoji} ${userBank.name}`;

			// Check if user has an account
			const existingUser = await KythiaUser.getCache({ userId: userId });
			if (!existingUser) {
				const msg = await t(interaction, 'economy.withdraw.no.account.desc');
				const components = await simpleContainer(interaction, msg, {
					color: kythiaConfig.bot.color,
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			// Update user's bank type
			existingUser.bankType = bankType;
			existingUser.changed('bankType', true);
			await existingUser.save();

			const msg = await t(
				interaction,
				'economy.account.edit.account.edit.success.desc',
				{ bankType: bankDisplay },
			);
			const components = await simpleContainer(interaction, msg, {
				color: kythiaConfig.bot.color,
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			logger.error(
				`Error during account edit command execution: ${error.message || error}`,
				{
					label: 'core:commands:economy:account:edit',
				},
			);
			const msg = await t(
				interaction,
				'economy.account.edit.account.edit.error.desc',
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
}

exports.default = EditCommand;
