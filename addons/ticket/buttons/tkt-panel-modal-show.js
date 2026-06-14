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
				.setTitle('Create New Panel')
				.addLabelComponents(
					new LabelBuilder()
						.setLabel('Panel Channel ID')
						.setDescription(
							'Paste the ID of the channel where this panel will be sent.',
						)
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId('channelId')
								.setStyle(TextInputStyle.Short)
								.setPlaceholder('e.g. 123456789012345678')
								.setRequired(true),
						),

					new LabelBuilder()
						.setLabel('Panel Title')
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId('title')
								.setStyle(TextInputStyle.Short)
								.setPlaceholder('e.g. Kythia Support Center')
								.setRequired(true),
						),
					new LabelBuilder()
						.setLabel('Panel Description')
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId('description')
								.setStyle(TextInputStyle.Paragraph)
								.setPlaceholder('Select the type of ticket you need below.')
								.setRequired(false),
						),
					new LabelBuilder()
						.setLabel('Panel Image URL (Optional)')
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId('image')
								.setStyle(TextInputStyle.Short)
								.setPlaceholder('https://... (Image URL for panel)')
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
					'ticket.errors.modal_show_failed_panel',
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

module.exports = TktPanelModalShowButton;
