/**
 * @namespace: addons/core/commands/utils/kyth/premium/edit.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

module.exports = {
	slashCommand: (subcommand) =>
		subcommand
			.setName('edit')
			.setDescription('Edit a premium user')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('User to edit premium access')
					.setRequired(true),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, helpers } = container;
		const { KythiaUser } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const user = interaction.options.getUser('user');
		const days = interaction.options.getInteger('days');

		const kythiaUser = await KythiaUser.getCache({ userId: user.id });
		if (!kythiaUser) {
			return interaction.editReply(
				await t(interaction, 'core.premium.premium.not.premium'),
			);
		}
		const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
		kythiaUser.premiumExpiresAt = expiresAt;
		await kythiaUser.save();

		const msg = await t(interaction, 'core.premium.premium.edit.success', {
			user: `<@${user.id}>`,
			days,
			expires: `<t:${Math.floor(expiresAt.getTime() / 1000)}:R>`,
		});
		const components = await simpleContainer(interaction, msg, {
			color: 'Red',
		});
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
