/**
 * @namespace: addons/ticket/buttons/tkt-panel-modal-show.js
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
	MessageFlags,
} = require('discord.js');
const { BaseButton } = require('kythia-core');
class TktPanelModalShowButton extends BaseButton {
	button = {};
	async execute(interaction) {
		const container = this.container;
		const { t, helpers, logger } = container;
		const { simpleContainer } = helpers.discord;
		const originalMessageId = interaction.message.id;
		try {
			const modal = new ModalBuilder()
				.setCustomId(`tkt-panel-create:${originalMessageId}`)
				.setTitle(
					await interaction.client.container.t(
						interaction,
						'ticket.ui.create_panel',
					),
				)
				.addLabelComponents(
					new LabelBuilder()
						.setLabel(
							await interaction.client.container.t(
								interaction,
								'ticket.ui.panel_channel_id',
							),
						)
						.setDescription(
							'Paste the ID of the channel where this panel will be sent.',
						)
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId('channelId')
								.setStyle(TextInputStyle.Short)
								.setPlaceholder(
									await interaction.client.container.t(
										interaction,
										'ticket.ui.ph_panel_id',
									),
								)
								.setRequired(true),
						),
					new LabelBuilder()
						.setLabel(
							await interaction.client.container.t(
								interaction,
								'ticket.ui.panel_title',
							),
						)
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId('title')
								.setStyle(TextInputStyle.Short)
								.setPlaceholder(
									await interaction.client.container.t(
										interaction,
										'ticket.ui.ph_kythia_support',
									),
								)
								.setRequired(true),
						),
					new LabelBuilder()
						.setLabel(
							await interaction.client.container.t(
								interaction,
								'ticket.ui.panel_desc',
							),
						)
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId('description')
								.setStyle(TextInputStyle.Paragraph)
								.setPlaceholder(
									await interaction.client.container.t(
										interaction,
										'ticket.ui.ph_select_type',
									),
								)
								.setRequired(false),
						),
					new LabelBuilder()
						.setLabel(
							await interaction.client.container.t(
								interaction,
								'ticket.ui.panel_img',
							),
						)
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId('image')
								.setStyle(TextInputStyle.Short)
								.setPlaceholder(
									await interaction.client.container.t(
										interaction,
										'ticket.ui.ph_img_panel',
									),
								)
								.setRequired(false),
						),
				);
			await interaction.showModal(modal);
		} catch (error) {
			logger.error(
				`Error in tkt-panel-modal-show handler: ${error.message || error}`,
				{
					label: 'ticket',
				},
			);
			if (!interaction.replied && !interaction.deferred) {
				const desc = await t(
					interaction,
					'ticket.buttons.tkt-panel-modal-show.errors.modal_show_failed_panel',
				);
				await interaction.reply({
					components: await simpleContainer(interaction, desc, {
						color: 'Red',
					}),
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			}
		}
	}
}
exports.default = TktPanelModalShowButton;
