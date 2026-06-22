/**
 * @namespace: addons/ai/commands/ai/forget.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
const AIMessageHandler = require('../../helpers/handlers/AIMessageHandler');
class ForgetCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('forget')
			.setDescription('Clear your conversation history with AI');
	async execute(interaction) {
		const container = this.container;
		const { t, helpers } = container;
		const { simpleContainer } = helpers.discord;
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});
		const tempHandler = new AIMessageHandler(container);
		tempHandler.conversationManager.deleteConversation(interaction.channel.id);
		const msg = await t(interaction, 'ai.commands.ai.forget.ai.success');
		const components = await simpleContainer(interaction, msg, {
			color: 'Green',
		});
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
exports.default = ForgetCommand;
