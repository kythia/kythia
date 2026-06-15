/**
 * @namespace: addons/core/commands/utils/kyth/vote/add.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { BaseCommand } = require('kythia-core');

class AddCommand extends BaseCommand {
	slashCommand = (subcommand) =>
		subcommand
			.setName('add')
			.setDescription('Add vote points to a user')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('The user to add points to')
					.setRequired(true),
			)
			.addIntegerOption((option) =>
				option
					.setName('amount')
					.setDescription('The number of points to add')
					.setRequired(true)
					.setMinValue(1),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { simpleContainer } = helpers.discord;
		const { KythiaUser } = models;

		const targetUser = interaction.options.getUser('user', true);
		const amount = interaction.options.getInteger('amount', true);

		// Defer reply since database operations may take a brief moment
		await interaction.deferReply();

		try {
			// Get or create KythiaUser
			const [userRecord, created] = await KythiaUser.getOrCreateCache(
				{ userId: targetUser.id },
				{ userId: targetUser.id, votePoints: amount },
			);

			if (!created) {
				userRecord.votePoints = (userRecord.votePoints || 0) + amount;
				await userRecord.save();
			}

			const components = await simpleContainer(
				interaction,
				await t(interaction, 'core.utils.kyth.vote.add.success', {
					user: targetUser.toString(),
					amount,
					total: userRecord.votePoints,
				}),
				{ mode: 'success' },
			);

			await interaction.editReply({ components });
		} catch (error) {
			container.logger.error(
				`[kythia-vote] Error: ${error.message || String(error)}`,
				{ label: 'kythia-vote' },
			);
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'common.error'),
				{ mode: 'error' },
			);
			await interaction.editReply({ components });
		}
	}
}

exports.default = AddCommand;
