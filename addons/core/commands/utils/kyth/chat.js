/**
 * @namespace: addons/core/commands/utils/kyth/chat.js
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
			.setName('chat')
			.setDescription('Direct message a user as the bot')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('The user to message')
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('message')
					.setDescription('The message content to send')
					.setRequired(true),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, logger, helpers } = container;
		const { createContainer, simpleContainer } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const user = interaction.options.getUser('user');
		const message = interaction.options.getString('message');

		try {
			const sendComponents = await simpleContainer(interaction, message);

			await user.send({
				components: sendComponents,
				flags: MessageFlags.IsComponentsV2,
			});

			const components = await createContainer(interaction, {
				title: await t(interaction, 'core.utils.kyth.chat.success.title'),
				description: await t(interaction, 'core.utils.kyth.chat.success.desc', {
					tag: user.tag,
				}),
				color: 'Green',
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
			logger.info(
				`Dev chat sent to ${user.tag} (${user.id}) by ${interaction.user.tag}`,
				{ label: 'core' },
			);
		} catch (error) {
			logger.error(`Failed to DM user ${user.tag}: ${error.message || error}`, {
				label: 'core',
			});
			const components = await createContainer(interaction, {
				description: await t(interaction, 'core.utils.kyth.chat.error', {
					error: error.message,
				}),
				color: 'Red',
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	},
};
