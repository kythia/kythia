/**
 * @namespace: addons/economy/commands/company/fire.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('fire')
			.setDescription('🏢 (Company Owner) Fire an employee from your company.')
			.addUserOption((option) =>
				option
					.setName('target')
					.setDescription('The employee you want to fire')
					.setRequired(true),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
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

		const targetUser = interaction.options.getUser('target');

		const target = await KythiaUser.getCache({ userId: targetUser.id });
		if (!target || target.employerId !== interaction.user.id) {
			const msg = await t(
				interaction,
				'economy.company.fire.error.not_employee',
				{
					target: targetUser.username,
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

		target.employerId = null;
		target.changed('employerId', true);
		await target.save();

		const msg = await t(interaction, 'economy.company.fire.success', {
			target: targetUser.username,
		});

		const components = await simpleContainer(interaction, msg, {
			color: 'Green',
		});

		// Notify employee
		const dmMsg = await t(interaction, 'economy.company.fire.dm', {
			employer: interaction.user.username,
		});
		const dmComponents = await simpleContainer(interaction, dmMsg, {
			color: 'Red',
		});
		targetUser
			.send({ components: dmComponents, flags: MessageFlags.IsComponentsV2 })
			.catch(() => {});

		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
