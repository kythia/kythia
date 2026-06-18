/**
 * @namespace: addons/core/commands/utils/kyth/presence/username.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class UsernameCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('username')
			.setDescription('Change bot username')
			.addStringOption((option) =>
				option
					.setName('username')
					.setDescription('New username (2-32 characters)')
					.setRequired(true)
					.setMinLength(2)
					.setMaxLength(32),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, helpers, logger } = container;
		const { simpleContainer } = helpers.discord;
		await interaction.deferReply();
		try {
			const username = interaction.options.getString('username');
			const oldUsername = interaction.client.user.username;
			await interaction.client.user.setUsername(username);
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'core.utils.presence.username.success', {
					old: oldUsername,
					new: username,
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
			logger.error(`Error setting username: ${error.message || error}`, {
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
exports.default = UsernameCommand;
