/**
 * @namespace: addons/ticket/commands/panel/reload.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { refreshTicketPanel } = require('../../helpers');

module.exports = {
	slashCommand: (subcommand) =>
		subcommand
			.setName('reload')
			.setDescription('Refreshes a ticket panel (updates buttons & menus).')
			.addStringOption((option) =>
				option
					.setName('message_id')
					.setDescription('Select the panel to refresh.')
					.setAutocomplete(true)
					.setRequired(true),
			),

	async autocomplete(interaction, container) {
		const { models } = container;
		const { TicketPanel } = models;

		const focusedValue = interaction.options.getFocused();
		const guildId = interaction.guild.id;

		const panels = await TicketPanel.getAllCache({ guildId });

		if (!panels || panels.length === 0) {
			return interaction.respond([]);
		}

		const filtered = panels.filter(
			(panel) =>
				panel.title.toLowerCase().includes(focusedValue.toLowerCase()) ||
				panel.messageId.includes(focusedValue),
		);

		const options = filtered.slice(0, 25).map((panel) => ({
			name: `${panel.title.substring(0, 50)} (${panel.messageId})`,
			value: panel.messageId,
		}));

		await interaction.respond(options);
	},

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, helpers, logger } = container;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		try {
			const panelMessageId = interaction.options.getString('message_id');

			await refreshTicketPanel(panelMessageId, container);

			const desc = await t(interaction, 'ticket.panel.reload_success', {
				id: panelMessageId,
			});

			await interaction.editReply({
				components: await simpleContainer(interaction, desc, {
					color: 'Green',
				}),
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			logger.error(`Error reloading panel: ${error.message || error}`, {
				label: 'ticket',
			});
			const desc = await t(interaction, 'ticket.errors.generic');
			await interaction.editReply({
				components: await simpleContainer(interaction, desc, { color: 'Red' }),
			});
		}
	},
};
