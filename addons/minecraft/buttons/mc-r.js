/**
 * @namespace: addons/minecraft/buttons/mc-r.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const {
	buildStatusComponents,
	fetchServerStatus,
} = require('../commands/server/status');

module.exports = {
	/**
	 * customId format: mc-r_<type>_<host>_<port>
	 * @param {import('discord.js').ButtonInteraction} interaction
	 */
	execute: async (interaction) => {
		const container = interaction.client.container;
		const { t, kythiaConfig, helpers } = container;

		// Parse customId: mc-r:<type>:<host>:<port>
		const parts = interaction.customId.split(':');
		// parts[0] = 'mc-r', [1] = type, [2] = host, [3] = port
		if (parts.length < 4 || parts[0] !== 'mc-r') return;

		const type = parts[1];
		const host = parts[2];
		const port = parseInt(parts[3], 10);

		await interaction.deferUpdate();

		const accentColor = helpers.color.convertColor(kythiaConfig.bot.color, {
			from: 'hex',
			to: 'decimal',
		});

		let data;
		try {
			data = await fetchServerStatus(host, port, type);
		} catch {
			return interaction.followUp({
				content: await t(interaction, 'minecraft.server.errors.fetch_failed'),
				flags: MessageFlags.Ephemeral,
			});
		}

		const components = await buildStatusComponents(
			interaction,
			data,
			host,
			port,
			type,
			t,
			accentColor,
		);

		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
