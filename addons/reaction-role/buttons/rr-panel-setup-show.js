/**
 * @namespace: addons/reaction-role/buttons/rr-panel-setup-show.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	ModalBuilder,
	LabelBuilder,
	TextInputBuilder,
	TextInputStyle,
	ChannelSelectMenuBuilder,
	ChannelType,
	MessageFlags,
} = require('discord.js');

const { BaseButton } = require('kythia-core');

class RrPanelSetupShowButton extends BaseButton {
	button = {};

	async execute(interaction) {
		const container = this.container;

		const { helpers, logger } = container;
		const { simpleContainer } = helpers.discord;
		const originalMessageId = interaction.message.id;

		try {
			const modal = new ModalBuilder()
				.setCustomId(`rr-panel-create:${originalMessageId}`)
				.setTitle('Create Reaction Role Panel')
				.addLabelComponents(
					// Mode selection
					new LabelBuilder()
						.setLabel('Mode')
						.setDescription(
							'"post_embed" — bot posts new embed | "use_message" — use existing message ID',
						)
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId('mode')
								.setStyle(TextInputStyle.Short)
								.setPlaceholder('post_embed')
								.setValue('post_embed')
								.setRequired(true),
						),

					// Panel type — reaction or dropdown
					new LabelBuilder()
						.setLabel('Panel Type')
						.setDescription(
							'"reaction" — users react with emoji | "dropdown" — users pick from a select menu',
						)
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId('panelType')
								.setStyle(TextInputStyle.Short)
								.setPlaceholder('reaction')
								.setValue('reaction')
								.setRequired(true),
						),

					// Channel: used for both modes
					new LabelBuilder()
						.setLabel('Channel')
						.setDescription(
							'The channel where the panel message is (or will be sent).',
						)
						.setChannelSelectMenuComponent(
							new ChannelSelectMenuBuilder()
								.setCustomId('channelId')
								.setPlaceholder('Select a channel...')
								.addChannelTypes(ChannelType.GuildText)
								.setMinValues(1)
								.setMaxValues(1),
						),

					// Message ID — only required for use_message mode
					new LabelBuilder()
						.setLabel('Message ID (only for "use_message" mode)')
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId('messageId')
								.setStyle(TextInputStyle.Short)
								.setPlaceholder('Leave empty for post_embed mode')
								.setRequired(false),
						),

					// Panel title — used as embed heading for post_embed mode
					new LabelBuilder()
						.setLabel('Panel Title (for post_embed mode)')
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId('title')
								.setStyle(TextInputStyle.Short)
								.setPlaceholder('e.g. 🎭 Pick Your Roles')
								.setRequired(false),
						),

					// Panel description
					new LabelBuilder()
						.setLabel('Panel Description (optional)')
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId('description')
								.setStyle(TextInputStyle.Paragraph)
								.setPlaceholder('React below to pick up a role.')
								.setRequired(false),
						),
				);

			await interaction.showModal(modal);
		} catch (error) {
			logger.error(`Error: ${error.message || error}`, {
				label: 'reaction-role:rr-panel-setup-show',
			});
			if (!interaction.replied && !interaction.deferred) {
				await interaction.reply({
					components: await simpleContainer(
						interaction,
						'❌ Failed to open the setup modal.',
						{ color: 'Red' },
					),
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			}
		}
	}
}

exports.default = RrPanelSetupShowButton;
