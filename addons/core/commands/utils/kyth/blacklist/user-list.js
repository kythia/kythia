/**
 * @namespace: addons/core/commands/utils/kyth/blacklist/user-list.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class UserListCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('user-list')
			.setDescription('List all blacklisted users');
	async execute(interaction) {
		const container = this.container;
		const { t, models, logger, helpers, client } = container;
		const { KythiaBlacklist } = models;
		const { createContainer } = helpers.discord;
		await interaction.deferReply();
		try {
			const entries = await KythiaBlacklist.getAllCache({
				where: {
					type: 'user',
				},
			});
			if (entries.length === 0) {
				const components = await createContainer(interaction, {
					description: await t(
						interaction,
						'core.commands.utils.kyth.blacklist.user-list.user.list.empty',
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
				'core.helpers.index.utils.kyth.blacklist.no.reason',
			);
			const unknownUser = await t(
				interaction,
				'core.commands.utils.kyth.blacklist.user-list.user.list.unknown',
			);
			const rows = await Promise.all(
				entries.map(async (entry) => {
					const fetchedUser =
						await client.container.helpers.discord.getUserSafe(
							client,
							entry.targetId,
						);
					const tag = fetchedUser
						? fetchedUser.tag
						: `${unknownUser} (${entry.targetId})`;
					return t(
						interaction,
						'core.commands.utils.kyth.blacklist.user-list.user.list.row',
						{
							tag,
							id: entry.targetId,
							reason: entry.reason || noReason,
						},
					);
				}),
			);
			const description =
				(await t(
					interaction,
					'core.commands.utils.kyth.blacklist.user-list.user.list.total',
					{
						count: entries.length,
					},
				)) +
				'\n\n' +
				rows.join('\n\n');
			const components = await createContainer(interaction, {
				title: await t(
					interaction,
					'core.commands.utils.kyth.blacklist.user-list.user.list.title',
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
					'core.commands.utils.kyth.blacklist.user-list.user.list.error',
					{
						error: error.message,
					},
				),
				color: 'Red',
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}
exports.default = UserListCommand;
