/**
 * @namespace: addons/core/commands/utils/kyth/vote/reset.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Op } = require('sequelize');
const { BaseCommand } = require('kythia-core');
class ResetCommand extends BaseCommand {
	slashCommand = (subcommand) =>
		subcommand
			.setName('reset')
			.setDescription('Reset vote points for a user or all users')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription(
						'The user to reset points for (leave empty for ALL users)',
					)
					.setRequired(false),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { simpleContainer } = helpers.discord;
		const { KythiaUser } = models;
		const targetUser = interaction.options.getUser('user');
		await interaction.deferReply();
		try {
			if (targetUser) {
				const userRecord = await KythiaUser.getCache({
					userId: targetUser.id,
				});
				if (userRecord) {
					userRecord.votePoints = 0;
					await userRecord.save();
				}
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'core.commands.utils.kyth.vote.reset.user.success',
						{
							user: targetUser.toString(),
						},
					),
					{
						mode: 'success',
					},
				);
				await interaction.editReply({
					components,
				});
			} else {
				// Bulk reset all vote points
				await KythiaUser.update(
					{
						votePoints: 0,
					},
					{
						where: {
							votePoints: {
								[Op.gt]: 0,
							},
						},
					},
				);
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'core.commands.utils.kyth.vote.reset.all.success',
					),
					{
						mode: 'success',
					},
				);
				await interaction.editReply({
					components,
				});
			}
		} catch (error) {
			container.logger.error(
				`[vote] Error: ${error.message || String(error)}`,
				{
					label: 'vote',
				},
			);
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'common.error'),
				{
					mode: 'error',
				},
			);
			await interaction.editReply({
				components,
			});
		}
	}
}
exports.default = ResetCommand;
