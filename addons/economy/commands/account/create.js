/**
 * @namespace: addons/economy/commands/account/create.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags } = require('discord.js');
const banks = require('../../helpers/banks');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('create')
			.setDescription('👤 Create an account and choose a bank type.')
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
			),
	async execute(interaction, container) {
		const { t, models, kythiaConfig, helpers } = container;
		const { KythiaUser } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();
		const bankType = interaction.options.getString('bank');
		const userId = interaction.user.id;
		const userBank = banks.getBank(bankType);
		const bankDisplay = `${userBank.emoji} ${userBank.name}`;
		const existingUser = await KythiaUser.getCache({ userId: userId });
		if (existingUser) {
			const msg = await t(
				interaction,
				'economy.account.create.account.create.already.desc',
			);
			const components = await simpleContainer(interaction, msg, {
				color: kythiaConfig.bot.color,
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		// Create new user account
		await KythiaUser.create({ userId, bankType });

		const msg = await t(
			interaction,
			'economy.account.create.account.create.success.desc',
			{ bankType: bankDisplay },
		);
		const components = await simpleContainer(interaction, msg, {
			color: kythiaConfig.bot.color,
		});
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
