/**
 * @namespace: addons/economy/commands/company/resign.js
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
			.setName('resign')
			.setDescription('🏃‍♂️ Resign from your current employer.'),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, helpers } = container;
		const { KythiaUser } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const user = await KythiaUser.getCache({ userId: interaction.user.id });
		if (!user?.employerId) {
			const msg = await t(
				interaction,
				'economy.company.resign.error.not_employed',
			);
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const employerId = user.employerId;

		user.employerId = null;
		user.changed('employerId', true);
		await user.save();

		const msg = await t(interaction, 'economy.company.resign.success');
		const components = await simpleContainer(interaction, msg, {
			color: 'Green',
		});

		// Try to notify employer
		try {
			const employerDiscordUser =
				await interaction.client.users.fetch(employerId);
			if (employerDiscordUser) {
				const dmMsg = await t(interaction, 'economy.company.resign.dm', {
					employee: interaction.user.username,
				});
				const dmComponents = await simpleContainer(interaction, dmMsg, {
					color: 'Yellow',
				});
				employerDiscordUser
					.send({
						components: dmComponents,
						flags: MessageFlags.IsComponentsV2,
					})
					.catch(() => {});
			}
		} catch {}

		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
