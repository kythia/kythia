/**
 * @namespace: addons/core/commands/utils/kyth/maintenance.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class MaintenanceCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('maintenance')
			.setDescription('Toggle maintenance mode for the entire bot (Owner Only)')
			.addBooleanOption((option) =>
				option
					.setName('enabled')
					.setDescription('Turn maintenance mode ON or OFF')
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('reason')
					.setDescription('Reason shown to users while under maintenance')
					.setRequired(false),
			);

	async execute(interaction) {
		const container = this.container;
		const { helpers, redis, logger } = container;
		const { createContainer } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const enabled = interaction.options.getBoolean('enabled');
		const reason = interaction.options.getString('reason') || 'System updates';

		// Store the maintenance state in global Redis cache
		// This applies to all shards globally
		if (enabled) {
			await redis.set('system:maintenance_mode', reason);
			logger.info(
				`Maintenance mode enabled by ${interaction.user.tag} (${interaction.user.id}). Reason: ${reason}`,
				{ label: 'maintenance' },
			);
		} else {
			await redis.del('system:maintenance_mode');
			logger.info(
				`Maintenance mode disabled by ${interaction.user.tag} (${interaction.user.id}).`,
				{ label: 'maintenance' },
			);
		}

		const components = await createContainer(interaction, {
			title: enabled ? '🚧 Maintenance Enabled' : '✅ Maintenance Disabled',
			description: enabled
				? `The bot will no longer respond to normal users.\n\n**Reason:** ${reason}`
				: `The bot is now accepting commands from all users again.`,
			color: enabled ? 'Red' : 'Green',
		});

		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = MaintenanceCommand;
