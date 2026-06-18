/**
 * @namespace: addons/core/commands/utils/kyth/presence/bio.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class BioCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('bio')
			.setDescription('Change bot bio/about me')
			.addStringOption((option) =>
				option
					.setName('bio')
					.setDescription('New bio text (max 190 characters)')
					.setRequired(true)
					.setMaxLength(190),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, helpers, logger } = container;
		const { simpleContainer } = helpers.discord;
		await interaction.deferReply();
		try {
			const bio = interaction.options.getString('bio');
			await interaction.client.user.edit({
				bio,
			});
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'core.utils.presence.bio.success', {
					bio,
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
			logger.error(`Error setting bio: ${error.message || error}`, {
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
exports.default = BioCommand;
