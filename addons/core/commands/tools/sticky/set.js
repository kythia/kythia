/**
 * @namespace: addons/core/commands/tools/sticky/set.js
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
			.setName('set')
			.setDescription('Sets a sticky message for this channel.')
			.addStringOption((option) =>
				option
					.setName('message')
					.setDescription('The content of the sticky message.')
					.setRequired(true),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, helpers, models } = container;
		const { simpleContainer } = helpers.discord;
		const { StickyMessage } = models;

		const channelId = interaction.channel.id;
		const messageContent = interaction.options.getString('message');
		const existingSticky = await StickyMessage.getCache({ channelId });

		if (existingSticky) {
			return interaction.reply({
				content: await t(interaction, 'core.tools.sticky.set.error.exists'),
				flags: MessageFlags.Ephemeral,
			});
		}

		const components = await simpleContainer(interaction, messageContent);
		const message = await interaction.channel.send({
			components,
			flags: MessageFlags.IsComponentsV2,
		});

		await StickyMessage.create(
			{
				channelId,
				message: messageContent,
				messageId: message.id,
			},
			{ individualHooks: true },
		);

		return interaction.reply({
			content: await t(interaction, 'core.tools.sticky.set.success'),
			flags: MessageFlags.Ephemeral,
		});
	},
};
