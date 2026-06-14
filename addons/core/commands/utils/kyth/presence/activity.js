/**
 * @namespace: addons/core/commands/utils/kyth/presence/activity.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { ActivityType, MessageFlags } = require('discord.js');
const {
	ACTIVITY_TYPE_OPTIONS,
} = require('../../../../helpers/presenceConstants');

const { BaseCommand } = require('kythia-core');

class ActivityCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('activity')
			.setDescription('🎮 Set bot activity only')
			.addStringOption((option) =>
				option
					.setName('type')
					.setDescription('Activity type')
					.setRequired(true)
					.addChoices(...ACTIVITY_TYPE_OPTIONS),
			)
			.addStringOption((option) =>
				option
					.setName('name')
					.setDescription('Activity name')
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('url')
					.setDescription('Streaming URL (Twitch/YouTube)')
					.setRequired(false),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, helpers, logger } = container;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();

		try {
			const type = interaction.options.getString('type');
			const activityName = interaction.options.getString('name');
			const url = interaction.options.getString('url');

			const activityPayload = {
				name: activityName,
				type: ActivityType[type],
			};

			if (activityPayload.type === ActivityType.Streaming && url) {
				activityPayload.url = url;
			}

			await interaction.client.user.setActivity(activityPayload);

			const components = await simpleContainer(
				interaction,
				await t(interaction, 'core.utils.presence.activity.success', {
					activity: activityName,
					type,
				}),
				{ color: 'Green' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			logger.error(`Error setting activity: ${error.message || error}`, {
				label: 'presence',
			});
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'core.utils.presence.error', {
					error: error.message,
				}),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}

exports.default = ActivityCommand;
