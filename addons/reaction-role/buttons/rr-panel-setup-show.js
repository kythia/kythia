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
				.setTitle(
					await interaction.client.container.t(
						interaction,
						'reaction-role.ui.create_panel',
					),
				)
				.addLabelComponents(
					// Mode selection
					new LabelBuilder()
						.setLabel(
							await interaction.client.container.t(
								interaction,
								'reaction-role.ui.mode',
							),
						)
						.setDescription(
							'"post_embed" — bot posts new embed | "use_message" — use existing message ID',
						)
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId('mode')
								.setStyle(TextInputStyle.Short)
								.setPlaceholder(
									await interaction.client.container.t(
										interaction,
										'reaction-role.ui.ph_post_embed',
									),
								)
								.setValue('post_embed')
								.setRequired(true),
						),

					// Panel type — reaction or dropdown
					new LabelBuilder()
						.setLabel(
							await interaction.client.container.t(
								interaction,
								'reaction-role.ui.panel_type',
							),
						)
						.setDescription(
							'"reaction" — users react with emoji | "dropdown" — users pick from a select menu',
						)
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId('panelType')
								.setStyle(TextInputStyle.Short)
								.setPlaceholder(
									await interaction.client.container.t(
										interaction,
										'reaction-role.ui.ph_reaction',
									),
								)
								.setValue('reaction')
								.setRequired(true),
						),

					// Channel: used for both modes
					new LabelBuilder()
						.setLabel(
							await interaction.client.container.t(
								interaction,
								'reaction-role.ui.channel',
							),
						)
						.setDescription(
							'The channel where the panel message is (or will be sent).',
						)
						.setChannelSelectMenuComponent(
							new ChannelSelectMenuBuilder()
								.setCustomId('channelId')
								.setPlaceholder(
									await interaction.client.container.t(
										interaction,
										'reaction-role.ui.ph_select_channel',
									),
								)
								.addChannelTypes(ChannelType.GuildText)
								.setMinValues(1)
								.setMaxValues(1),
						),

					// Message ID — only required for use_message mode
					new LabelBuilder()
						.setLabel(
							await interaction.client.container.t(
								interaction,
								'reaction-role.ui.msg_id',
							),
						)
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId('messageId')
								.setStyle(TextInputStyle.Short)
								.setPlaceholder(
									await interaction.client.container.t(
										interaction,
										'reaction-role.ui.ph_leave_empty',
									),
								)
								.setRequired(false),
						),

					// Panel title — used as embed heading for post_embed mode
					new LabelBuilder()
						.setLabel(
							await interaction.client.container.t(
								interaction,
								'reaction-role.ui.panel_title',
							),
						)
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId('title')
								.setStyle(TextInputStyle.Short)
								.setPlaceholder(
									await interaction.client.container.t(
										interaction,
										'reaction-role.ui.ph_pick_roles',
									),
								)
								.setRequired(false),
						),

					// Panel description
					new LabelBuilder()
						.setLabel(
							await interaction.client.container.t(
								interaction,
								'reaction-role.ui.panel_desc',
							),
						)
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId('description')
								.setStyle(TextInputStyle.Paragraph)
								.setPlaceholder(
									await interaction.client.container.t(
										interaction,
										'reaction-role.ui.ph_react_below',
									),
								)
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
