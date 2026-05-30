/**
 * @namespace: addons/modmail/buttons/mm-close-with-reason.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ActionRowBuilder,
} = require('discord.js');

module.exports = {
	execute: async (interaction, container) => {
		const { t } = container;

		const modal = new ModalBuilder()
			.setCustomId('mm-close-reason-submit')
			.setTitle(await t(interaction, 'modmail.close.reason_modal_title'));

		modal.addComponents(
			new ActionRowBuilder().addComponents(
				new TextInputBuilder()
					.setCustomId('reason')
					.setLabel(await t(interaction, 'modmail.close.reason_label'))
					.setStyle(TextInputStyle.Paragraph)
					.setPlaceholder(
						await t(interaction, 'modmail.close.reason_placeholder'),
					)
					.setRequired(true)
					.setMinLength(5)
					.setMaxLength(500),
			),
		);

		return interaction.showModal(modal);
	},
};
