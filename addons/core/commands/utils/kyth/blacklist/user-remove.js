/**
 * @namespace: addons/core/commands/utils/kyth/blacklist/user-remove.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class UserRemoveCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('user-remove')
			.setDescription('Remove a user from the blacklist')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('User to remove from blacklist')
					.setRequired(true),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, models, logger, helpers } = container;
		const { KythiaBlacklist } = models;
		const { createContainer } = helpers.discord;
		await interaction.deferReply();
		const user = interaction.options.getUser('user');
		try {
			const existing = await KythiaBlacklist.getCache({
				where: {
					type: 'user',
					targetId: user.id,
				},
			});
			if (!existing) {
				const components = await createContainer(interaction, {
					description: await t(
						interaction,
						'core.commands.utils.kyth.blacklist.user-remove.user.remove.not.found',
						{
							tag: user.tag,
						},
					),
					color: 'Red',
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			await KythiaBlacklist.destroy({
				where: {
					type: 'user',
					targetId: user.id,
				},
			});
			const components = await createContainer(interaction, {
				title: await t(
					interaction,
					'core.commands.utils.kyth.blacklist.user-remove.user.remove.title',
				),
				description: await t(
					interaction,
					'core.commands.utils.kyth.blacklist.user-remove.user.remove.success',
					{
						tag: user.tag,
						id: user.id,
					},
				),
				color: 'Green',
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
			logger.info(
				`User ${user.tag} (${user.id}) removed from blacklist by ${interaction.user.tag}`,
				{
					label: 'core',
				},
			);
		} catch (error) {
			logger.error(
				`Failed to remove user from blacklist: ${error.message || error}`,
				{
					label: 'core',
				},
			);
			const components = await createContainer(interaction, {
				description: await t(
					interaction,
					'core.commands.utils.kyth.blacklist.user-remove.user.remove.error',
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
exports.default = UserRemoveCommand;
