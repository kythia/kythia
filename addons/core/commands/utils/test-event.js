const {
	Events,
	SlashCommandBuilder,
	PermissionFlagsBits,
	InteractionContextType,
	MessageFlags,
} = require('discord.js');

module.exports = class TestEventCommand {
	slashCommand = new SlashCommandBuilder()
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
		.setContexts(InteractionContextType.Guild);

	async autocomplete(interaction, container) {
		try {
			const focused = interaction.options.getFocused(true);

			if (focused.name === 'event') {
				const focusedValue = focused.value || '';
				const choices = Object.entries(Events).map(([key, value]) => ({
					name: String(key)
						.replace(/([A-Z])/g, ' $1')
						.trim(),
					value: String(value),
				}));
				const filtered = choices
					.filter(
						(choice) =>
							choice.name.toLowerCase().includes(focusedValue.toLowerCase()) ||
							choice.value.toLowerCase().includes(focusedValue.toLowerCase()),
					)
					.slice(0, 10);

				await interaction.respond(
					filtered.map((choice) => ({
						name:
							choice.name.length > 100
								? `${choice.name.slice(0, 97)}...`
								: choice.name,
						value:
							choice.value.length > 100
								? choice.value.slice(0, 100)
								: choice.value,
					})),
				);
			} else if (focused.name === 'type') {
				const focusedValue = focused.value || '';
				const eventName = interaction.options.getString('event') || '';
				const { getEventScenarios } = require('../../helpers/events');
				const scenarios = getEventScenarios(eventName);
				const filtered = scenarios
					.filter((choice) =>
						choice.toLowerCase().includes(focusedValue.toLowerCase()),
					)
					.slice(0, 10);

				await interaction.respond(
					filtered.map((choice) => ({
						name: choice.length > 100 ? `${choice.slice(0, 97)}...` : choice,
						value: choice.length > 100 ? choice.slice(0, 100) : choice,
					})),
				);
			}
		} catch (err) {
			if (err.code !== 10062 && err.message !== 'Unknown interaction') {
				container.logger.warn(
					`Autocomplete error in testevent: ${err.message || err}`,
					{ label: 'core:testevent:autocomplete' },
				);
			}
			try {
				await interaction.respond([]);
			} catch (_) {}
		}
	}

	async execute(interaction, container) {
		const { logger } = container;
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
	}
};
