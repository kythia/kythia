/**
 * @namespace: addons/core/commands/utils/kyth/presence/set.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { ActivityType, MessageFlags } = require('discord.js');
const {
	STATUS_OPTIONS,
	ACTIVITY_TYPE_OPTIONS,
} = require('../../../../helpers/presenceConstants');
const { BaseCommand } = require('kythia-core');
class SetCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('set')
			.setDescription('Set bot presence (status + activity)')
			.addStringOption((option) =>
				option
					.setName('status')
					.setDescription('Bot status')
					.setRequired(true)
					.addChoices(...STATUS_OPTIONS),
			)
			.addStringOption((option) =>
				option
					.setName('type')
					.setDescription('Activity type')
					.setRequired(true)
					.addChoices(...ACTIVITY_TYPE_OPTIONS),
			)
			.addStringOption((option) =>
				option
					.setName('activity')
					.setDescription('Activity name')
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('url')
					.setDescription(
						'Streaming URL (Twitch/YouTube, required for streaming)',
					)
					.setRequired(false),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, helpers, logger } = container;
		const { simpleContainer } = helpers.discord;
		await interaction.deferReply();
		try {
			const status = interaction.options.getString('status');
			const type = interaction.options.getString('type');
			const activityName = interaction.options.getString('activity');
			const url = interaction.options.getString('url');
			const activityPayload = {
				name: activityName,
				type: ActivityType[type],
			};
			if (activityPayload.type === ActivityType.Streaming) {
				if (
					!url ||
					(!url.startsWith('https://www.twitch.tv/') &&
						!url.startsWith('https://www.youtube.com/'))
				) {
					const components = await simpleContainer(
						interaction,
						await t(interaction, 'core.utils.presence.invalid.url'),
						{
							color: 'Red',
						},
					);
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}
				activityPayload.url = url;
			}
			await interaction.client.user.setPresence({
				activities: [activityPayload],
				status,
			});
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'core.utils.presence.set.success', {
					status,
					activity: activityName,
					type,
				}),
				{
					color: 'Green',
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			logger.error(`Error setting presence: ${error.message || error}`, {
				label: 'presence',
			});
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'core.utils.presence.error', {
					error: error.message,
				}),
				{
					color: 'Red',
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}
exports.default = SetCommand;
