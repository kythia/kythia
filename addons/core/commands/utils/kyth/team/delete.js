/**
 * @namespace: addons/core/commands/utils/kyth/team/delete.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('delete')
			.setDescription('Remove a member from Kythia Team')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('User to remove from the team')
					.setRequired(true),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, logger, helpers } = container;
		const { KythiaTeam } = models;
		const { createContainer } = helpers.discord;

		await interaction.deferReply();

		const user = interaction.options.getUser('user');

		try {
			const existing = await KythiaTeam.getCache({ userId: user.id });
			if (!existing) {
				const components = await createContainer(interaction, {
					description: await t(
						interaction,
						'core.utils.kyth.team.delete.not.found',
						{ tag: user.tag },
					),
					color: 'Red',
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			await KythiaTeam.destroy({ where: { userId: user.id } });

			const components = await createContainer(interaction, {
				title: await t(interaction, 'core.utils.kyth.team.delete.title'),
				description: await t(
					interaction,
					'core.utils.kyth.team.delete.success',
					{
						tag: user.tag,
						id: user.id,
					},
				),
				color: 'Red',
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
			logger.info(
				`Removed ${user.tag} (${user.id}) from Kythia Team by ${interaction.user.tag}`,
				{ label: 'core' },
			);
		} catch (error) {
			logger.error(`Failed to remove team member: ${error.message || error}`, {
				label: 'core',
			});
			const components = await createContainer(interaction, {
				description: await t(interaction, 'core.utils.kyth.team.delete.error', {
					error: error.message,
				}),
				color: 'Red',
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	},
};
