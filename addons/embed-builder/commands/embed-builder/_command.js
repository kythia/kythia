/**
 * @namespace: addons/embed-builder/commands/embed-builder/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const {
	InteractionContextType,
	PermissionFlagsBits,
	SlashCommandBuilder,
} = require('discord.js');

module.exports = {
	slashCommand: new SlashCommandBuilder()
		.setName('embed-builder')
		.setDescription('🎨 Create and manage saved embeds for your server')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.setContexts(InteractionContextType.Guild),

	/**
	 * @param {import('discord.js').AutocompleteInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async autocomplete(interaction, container) {
		const focusedValue = interaction.options.getFocused();
		const { models } = container;
		const { EmbedBuilder } = models;

		try {
			const embeds = await EmbedBuilder.getAllCache({
				where: {
					guildId: interaction.guild.id,
				},
				limit: 25,
				order: [['name', 'ASC']],
			});

			const filtered = embeds
				.filter((e) =>
					e.name.toLowerCase().includes(focusedValue.toLowerCase()),
				)
				.slice(0, 25);

			await interaction.respond(
				filtered.map((e) => {
					const name = `${e.mode === 'components_v2' ? '🧩' : '📋'} ${e.name} (#${e.id})`;
					return {
						name: name.length > 100 ? name.slice(0, 100) : name,
						value: String(e.id),
					};
				}),
			);
		} catch {
			await interaction.respond([]);
		}
	},
};
