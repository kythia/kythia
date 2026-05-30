/**
 * @namespace: addons/core/commands/utils/kyth/blacklist/user-list.js
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
			.setName('user-list')
			.setDescription('List all blacklisted users'),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, logger, helpers, client } = container;
		const { KythiaBlacklist } = models;
		const { createContainer } = helpers.discord;

		await interaction.deferReply();

		try {
			const entries = await KythiaBlacklist.getAllCache({
				where: { type: 'user' },
			});

			if (entries.length === 0) {
				const components = await createContainer(interaction, {
					description: await t(
						interaction,
						'core.utils.kyth.blacklist.user.list.empty',
					),
					color: 'Blurple',
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			const noReason = await t(
				interaction,
				'core.utils.kyth.blacklist.no.reason',
			);
			const unknownUser = await t(
				interaction,
				'core.utils.kyth.blacklist.user.list.unknown',
			);
			const rows = await Promise.all(
				entries.map(async (entry) => {
					const fetchedUser = await client.users
						.fetch(entry.targetId)
						.catch(() => null);
					const tag = fetchedUser
						? fetchedUser.tag
						: `${unknownUser} (${entry.targetId})`;
					return t(interaction, 'core.utils.kyth.blacklist.user.list.row', {
						tag,
						id: entry.targetId,
						reason: entry.reason || noReason,
					});
				}),
			);

			const description =
				(await t(interaction, 'core.utils.kyth.blacklist.user.list.total', {
					count: entries.length,
				})) +
				'\n\n' +
				rows.join('\n\n');

			const components = await createContainer(interaction, {
				title: await t(
					interaction,
					'core.utils.kyth.blacklist.user.list.title',
				),
				description,
				color: 'Blurple',
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
			logger.info(`User blacklist viewed by ${interaction.user.tag}`, {
				label: 'core',
			});
		} catch (error) {
			logger.error(
				`Failed to list blacklisted users: ${error.message || error}`,
				{
					label: 'core',
				},
			);
			const components = await createContainer(interaction, {
				description: await t(
					interaction,
					'core.utils.kyth.blacklist.user.list.error',
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
