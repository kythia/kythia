const { MessageFlags } = require('discord.js');

module.exports = {
	name: 'maintenance',
	priority: 1, // Run before other middlewares

	/**
	 * @param {import('discord.js').Interaction} interaction
	 * @param {any} command
	 * @param {KythiaDI.Container} container
	 * @returns {Promise<boolean>}
	 */
	async execute(interaction, _command, container) {
		const { redis, t, helpers } = container;
		const { simpleContainer, isOwner } = helpers.discord;

		const maintenanceReason = await redis.get('system:maintenance_mode');

		if (maintenanceReason && interaction.user) {
			if (!isOwner(interaction.user.id)) {
				if (
					interaction.isRepliable() &&
					!interaction.replied &&
					!interaction.deferred
				) {
					try {
						const desc = await t(interaction, 'system.maintenance.active', {
							reason: maintenanceReason,
						});
						const components = await simpleContainer(interaction, desc, {
							color: 'Red',
						});

						await interaction.reply({
							components,
							flags: MessageFlags.IsComponentsV2,
						});
					} catch (_e) {}
				}
				return false; // Stop execution of the command
			}
		}

		return true; // Allow execution to proceed
	},
};
