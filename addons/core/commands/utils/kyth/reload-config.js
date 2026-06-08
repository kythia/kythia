/**
 * @namespace: addons/core/commands/utils/kyth/reload-config.js
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
const { reloadConfig } = require('../../../helpers/reload-config');

module.exports = {
	slashCommand: new SlashCommandBuilder()
		.setName('reloadconfig')
		.setDescription(
			'🔄️ Hot-reload Kythia configuration from .env and config file',
		)
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
			reloadConfig();

			await interaction.followUp({
				content: '✅ Kythia Configuration has been hot-reloaded successfully!',
			});
		} catch (error) {
			logger.error(`Failed to reload config: ${error.message || error}`, {
				label: 'reload-config',
			});

			await interaction.followUp({
				content: `❌ Failed to reload configuration: ${error.message}`,
			});
		}
	},
};
