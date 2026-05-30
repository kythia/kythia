/**
 * @namespace: addons/core/commands/utils/kyth/blacklist/user-add.js
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
			.setName('user-add')
			.setDescription('Add a user to the blacklist')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('User to blacklist')
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('reason')
					.setDescription('Reason for blacklisting')
					.setRequired(false),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, logger, helpers } = container;
		const { KythiaBlacklist } = models;
		const { createContainer } = helpers.discord;

		await interaction.deferReply();

		const user = interaction.options.getUser('user');
		const reason = interaction.options.getString('reason') || null;

		try {
			const existing = await KythiaBlacklist.getCache({
				where: { type: 'user', targetId: user.id },
			});
			if (existing) {
				const components = await createContainer(interaction, {
					description: await t(
						interaction,
						'core.utils.kyth.blacklist.user.add.already',
						{ tag: user.tag },
					),
					color: 'Red',
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			await KythiaBlacklist.create({ type: 'user', targetId: user.id, reason });

			const components = await createContainer(interaction, {
				title: await t(interaction, 'core.utils.kyth.blacklist.user.add.title'),
				description: await t(
					interaction,
					'core.utils.kyth.blacklist.user.add.success',
					{
						tag: user.tag,
						id: user.id,
						reason:
							reason ||
							(await t(interaction, 'core.utils.kyth.blacklist.no.reason')),
					},
				),
				color: 'Green',
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
			logger.info(
				`User ${user.tag} (${user.id}) blacklisted by ${interaction.user.tag} | Reason: ${reason ?? 'none'}`,
				{ label: 'core' },
			);
		} catch (error) {
			logger.error(`Failed to blacklist user: ${error.message || error}`, {
				label: 'core',
			});
			const components = await createContainer(interaction, {
				description: await t(
					interaction,
					'core.utils.kyth.blacklist.user.add.error',
					{ error: error.message },
				),
				color: 'Red',
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	},
};
