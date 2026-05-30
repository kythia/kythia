/**
 * @namespace: addons/core/commands/utils/test-event.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	Events,
	SlashCommandBuilder,
	PermissionFlagsBits,
	InteractionContextType,
	MessageFlags,
} = require('discord.js');

module.exports = {
	slashCommand: new SlashCommandBuilder()
		.setName('testevent')
		.setDescription('🧪 Trigger a Discord event for testing purposes')
		.addStringOption((option) =>
			option
				.setName('event')
				.setDescription('The event to trigger')
				.setRequired(true)
				.setAutocomplete(true),
		)
		.addStringOption((option) =>
			option
				.setName('type')
				.setDescription('The specific scenario to test')
				.setRequired(false)
				.setAutocomplete(true),
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setContexts(InteractionContextType.Guild),
	ownerOnly: true,
	mainGuildOnly: true,

	/**
	 * @param {import('discord.js').AutocompleteInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async autocomplete(interaction, container) {
		try {
			const focused = interaction.options.getFocused(true);

			if (focused.name === 'event') {
				const choices = Object.entries(Events).map(([key, value]) => ({
					name: key.replace(/([A-Z])/g, ' $1').trim(),
					value: value,
				}));
				const filtered = choices
					.filter(
						(choice) =>
							choice.name.toLowerCase().includes(focused.value.toLowerCase()) ||
							choice.value.toLowerCase().includes(focused.value.toLowerCase()),
					)
					.slice(0, 25);
				await interaction.respond(
					filtered.map((choice) => ({
						name:
							choice.name.length > 100
								? choice.name.slice(0, 100)
								: choice.name,
						value:
							choice.value.length > 100
								? choice.value.slice(0, 100)
								: choice.value,
					})),
				);
			} else if (focused.name === 'type') {
				const eventName = interaction.options.getString('event') || '';
				const { getEventScenarios } = require('../../helpers/events');
				const scenarios = getEventScenarios(eventName);
				const filtered = scenarios
					.filter((choice) =>
						choice.toLowerCase().includes(focused.value.toLowerCase()),
					)
					.slice(0, 25);
				await interaction.respond(
					filtered.map((choice) => ({
						name: choice.length > 100 ? choice.slice(0, 100) : choice,
						value: choice.length > 100 ? choice.slice(0, 100) : choice,
					})),
				);
			}
		} catch (err) {
			container.logger.warn(
				`Autocomplete error in testevent: ${err.message || err}`,
				{ label: 'core:testevent:autocomplete' },
			);
		}
	},

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { logger } = container;
		// 👇 Import langsung dari events helper
		const { createMockEventArgs } = require('../../helpers/events');

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const eventName = interaction.options.getString('event');
		const type = interaction.options.getString('type') || 'default';
		const { client, user } = interaction;

		logger.info(
			`[TEST COMMAND] Attempting to trigger '${eventName}' (type: ${type}) for ${user.tag}`,
			{ label: 'core' },
		);

		try {
			const args = await createMockEventArgs(eventName, interaction, type);
			client.emit(eventName, ...args);

			await interaction.editReply({
				content: `✅ Event \`${eventName}\` (type: \`${type}\`) emitted successfully!`,
			});
		} catch (err) {
			logger.error(
				`Error during event simulation '${eventName}': ${err.message || err}`,
				{ label: 'core' },
			);
			await interaction.editReply({
				content: `❌ Failed to emit event \`${eventName}\`: ${err.message}`,
			});
		}
	},
};
