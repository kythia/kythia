/**
 * @namespace: addons/ai/commands/ai/forget.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('forget')
			.setDescription('Clear your conversation history with AI'),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, helpers } = container;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		// Get the conversation manager from the AI message handler
		// We need to access the singleton instance
		const AIMessageHandler = require('../../helpers/handlers/AIMessageHandler');

		// The handler is lazily initialized in messageCreate.js
		// We'll create a temporary instance just to delete the conversation
		const tempHandler = new AIMessageHandler(container);
		tempHandler.conversationManager.deleteConversation(interaction.channel.id);

		const msg = await t(interaction, 'ai.ai.forget.success');
		const components = await simpleContainer(interaction, msg, {
			color: 'Green',
		});

		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
