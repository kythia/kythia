/**
 * @namespace: addons/music/commands/reload-node.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	PermissionFlagsBits,
	SlashCommandBuilder,
	InteractionContextType,
} = require('discord.js');
const { reloadLavalinkNodes } = require('../helpers/reload-node');

module.exports = {
	slashCommand: new SlashCommandBuilder()
		.setName('reloadnode')
		.setDescription('🔄️ Reload Lavalink nodes and configuration')
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	ownerOnly: true,
	mainGuildOnly: true,

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { logger } = container;
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		try {
			await reloadLavalinkNodes(interaction.client);

			await interaction.followUp({
				content: '✅ Config and Lavalink nodes have been reloaded!',
			});
		} catch (error) {
			logger.error(`Failed to reload nodes: ${error.message || error}`, {
				label: 'reload-node',
			});

			await interaction.followUp({
				content: `❌ Failed to reload nodes: ${error.message}`,
			});
		}
	},
};
