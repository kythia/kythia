/**
 * @namespace: addons/automod/commands/moderation/say.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
	slashCommand: (subcommand) =>
		subcommand
			.setName('say')
			.setDescription('🗣️ Makes the bot say something.')
			.addStringOption((option) =>
				option
					.setName('message')
					.setDescription('The message to say')
					.setRequired(true),
			),
	permissions: PermissionFlagsBits.Administrator,
	botPermissions: PermissionFlagsBits.ManageMessages,
	isOwner: true,

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, helpers } = container;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const message = interaction.options.getString('message');

		try {
			await interaction.channel.send(message);

			const reply = await simpleContainer(
				interaction,
				await t(interaction, 'core.moderation.say.success'),
				{ color: 'Green' },
			);
			return interaction.editReply({
				components: reply,
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		} catch (error) {
			const reply = await simpleContainer(
				interaction,
				await t(interaction, 'core.moderation.say.failed', {
					error: error.message,
				}),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components: reply,
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
	},
};
