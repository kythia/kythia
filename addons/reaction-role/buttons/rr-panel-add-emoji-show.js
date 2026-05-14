/**
 * @namespace: addons/reaction-role/buttons/rr-panel-add-emoji-show.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */
const {
	ModalBuilder,
	LabelBuilder,
	TextInputBuilder,
	TextInputStyle,
	MessageFlags,
} = require('discord.js');

module.exports = {
	execute: async (interaction, container) => {
		const { models, helpers, logger } = container;
		const { ReactionRolePanel } = models;
		const { simpleContainer } = helpers.discord;

		// customId format: rr-panel-add-emoji-show:<panelId>
		const panelId = interaction.customId.split(':')[1];

		try {
			if (!panelId) {
				return interaction.reply({
					components: await simpleContainer(
						interaction,
						'❌ Missing panel ID. Please delete this message and re-run `/reaction-role panel create`.',
						{ color: 'Red' },
					),
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			}

			// Fetch panel to know the type
			const panel = await ReactionRolePanel.getCache({
				where: { id: panelId, guildId: interaction.guildId },
			});

			const isDropdown = panel?.panelType === 'dropdown';

			const modal = new ModalBuilder()
				.setCustomId(`rr-panel-add-emoji:${panelId}`)
				.setTitle(
					isDropdown ? 'Add Option → Role Binding' : 'Add Emoji → Role Binding',
				)
				.addLabelComponents(
					new LabelBuilder()
						.setLabel('Emoji')
						.setDescription(
							'Unicode emoji (e.g. 🎮) or custom emoji string (e.g. <:name:id>)',
						)
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId('emoji')
								.setStyle(TextInputStyle.Short)
								.setPlaceholder('🎮')
								.setRequired(true),
						),

					new LabelBuilder()
						.setLabel(
							isDropdown ? 'Option Label (shown in dropdown)' : 'Role ID',
						)
						.setDescription(
							isDropdown
								? 'Text displayed in the select menu for this option.'
								: 'Paste the Discord role ID to assign.',
						)
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId(isDropdown ? 'label' : 'roleId')
								.setStyle(TextInputStyle.Short)
								.setPlaceholder(
									isDropdown ? 'e.g. Gamer Role' : '123456789012345678',
								)
								.setRequired(true),
						),

					...(isDropdown
						? [
								new LabelBuilder()
									.setLabel('Role ID')
									.setDescription('Paste the Discord role ID to assign.')
									.setTextInputComponent(
										new TextInputBuilder()
											.setCustomId('roleId')
											.setStyle(TextInputStyle.Short)
											.setPlaceholder('123456789012345678')
											.setRequired(true),
									),
							]
						: []),
				);

			await interaction.showModal(modal);
		} catch (error) {
			logger.error(`Error: ${error.message || error}`, {
				label: 'reaction-role:rr-panel-add-emoji-show',
			});
			if (!interaction.replied && !interaction.deferred) {
				await interaction.reply({
					components: await simpleContainer(
						interaction,
						'❌ Failed to open the emoji modal.',
						{ color: 'Red' },
					),
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			}
		}
	},
};
