/**
 * @namespace: addons/core/commands/utils/kyth/presence/banner.js
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
			.setName('banner')
			.setDescription('🎨 Change bot banner')
			.addAttachmentOption((option) =>
				option
					.setName('image')
					.setDescription('New banner image')
					.setRequired(true),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, helpers, logger } = container;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();

		try {
			const attachment = interaction.options.getAttachment('image');

			if (!attachment.contentType?.startsWith('image/')) {
				const components = await simpleContainer(
					interaction,
					await t(interaction, 'core.utils.presence.banner.invalid'),
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			await interaction.client.user.setBanner(attachment.url);

			const components = await simpleContainer(
				interaction,
				await t(interaction, 'core.utils.presence.banner.success'),
				{ color: 'Green' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			logger.error(`Error setting banner: ${error.message || error}`, {
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
	},
};
