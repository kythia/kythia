/**
 * @namespace: addons/ticket/buttons/ticket-close-with-reason.js
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

class TicketCloseWithReasonButton extends BaseButton {
	button = {};

	async execute(interaction) {
		const container = this.container;

		const { t, helpers, logger } = container;
		const { simpleContainer } = helpers.discord;

		try {
			const modal = new ModalBuilder()
				.setCustomId('tkt-close-reason-submit')
				.setTitle(await t(interaction, 'ticket.claim_modal.title'))
				.addLabelComponents(
					new LabelBuilder()
						.setLabel(await t(interaction, 'ticket.claim_modal.label'))
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId('reason')
								.setStyle(TextInputStyle.Paragraph)
								.setPlaceholder(
									await t(interaction, 'ticket.claim_modal.placeholder'),
								)
								.setRequired(true)
								.setMinLength(5)
								.setMaxLength(512),
						),
				);
			await interaction.showModal(modal);
		} catch (error) {
			logger.error(
				`Error showing close w/ reason modal: ${error.message || error}`,
				{
					label: 'ticket',
				},
			);
			const desc = await t(interaction, 'ticket.errors.modal_show_failed');
			if (!interaction.replied && !interaction.deferred) {
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

exports.default = TicketCloseWithReasonButton;
