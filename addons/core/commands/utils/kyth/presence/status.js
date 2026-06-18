/**
 * @namespace: addons/core/commands/utils/kyth/presence/status.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { STATUS_OPTIONS } = require('../../../../helpers/presenceConstants');
const { BaseCommand } = require('kythia-core');
class StatusCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('status')
			.setDescription('Set bot status only')
			.addStringOption((option) =>
				option
					.setName('status')
					.setDescription('Bot status')
					.setRequired(true)
					.addChoices(...STATUS_OPTIONS),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, helpers, logger } = container;
		const { simpleContainer } = helpers.discord;
		await interaction.deferReply();
		try {
			const status = interaction.options.getString('status');
			await interaction.client.user.setStatus(status);
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'core.utils.presence.status.success', {
					status,
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
			logger.error(`Error setting status: ${error.message || error}`, {
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
exports.default = StatusCommand;
