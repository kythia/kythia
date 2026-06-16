/**
 * @namespace: addons/core/commands/utils/kyth/reload-node.js
 * @type: Module
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
const { reloadLavalinkNodes } = require('../../../helpers/reloadNode');

const { BaseCommand } = require('kythia-core');

class ReloadNodeCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('reloadnode')
		.setDescription('🔄️ Reload Lavalink nodes and configuration')
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

	ownerOnly = true;
	mainGuildOnly = true;

	async execute(interaction) {
		const container = this.container;
		const { logger, t } = container;
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		try {
			await reloadLavalinkNodes(interaction.client);

			await interaction.followUp({
				content: await t(interaction, 'core.utils.kyth.reload_node'),
			});
		} catch (error) {
			logger.error(`Failed to reload nodes: ${error.message || error}`, {
				label: 'reload-node',
			});

			await interaction.followUp({
				content: `❌ Failed to reload nodes: ${error.message}`,
			});
		}
	}
}

exports.default = ReloadNodeCommand;
