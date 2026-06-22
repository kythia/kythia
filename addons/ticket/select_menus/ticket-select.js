/**
 * @namespace: addons/ticket/select_menus/ticket-select.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { createTicketChannel } = require('../helpers');
const {
	MessageFlags,
	ModalBuilder,
	LabelBuilder,
	TextInputBuilder,
	TextInputStyle,
} = require('discord.js');
const { BaseSelectMenu } = require('kythia-core');
class TicketSelectSelectMenu extends BaseSelectMenu {
	selectMenu = {};
	async execute(interaction) {
		const container = this.container;
		const { models, t, helpers } = container;
		const { TicketConfig } = models;
		const { simpleContainer } = helpers.discord;
		const configId = interaction.values[0];
		if (!configId) {
			const desc = await t(
				interaction,
				'ticket.select_menus.ticket-select.errors.invalid_selection',
				'❌ Invalid ticket selection.',
			);
			return interaction.reply({
				components: await simpleContainer(interaction, desc, {
					color: 'Red',
				}),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
		const ticketConfig = await TicketConfig.getCache({
			id: configId,
		});
		if (!ticketConfig) {
			const desc = await t(
				interaction,
				'ticket.helpers.index.errors.invalid_config',
			);
			return interaction.reply({
				components: await simpleContainer(interaction, desc, {
					color: 'Red',
				}),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
		if (ticketConfig.askReason && ticketConfig.askReason.length > 0) {
			const modal = new ModalBuilder()
				.setCustomId(`tkt-open-reason:${configId}`)
				.setTitle(
					await t(interaction, 'ticket.helpers.index.reason_modal.title'),
				)
				.addLabelComponents(
					new LabelBuilder()
						.setLabel(ticketConfig.askReason.slice(0, 45))
						.setDescription(
							await t(interaction, 'ticket.helpers.index.reason_modal.desc'),
						)
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId('reason')
								.setStyle(TextInputStyle.Paragraph)
								.setPlaceholder(
									await t(
										interaction,
										'ticket.helpers.index.reason_modal.placeholder',
									),
								)
								.setRequired(true)
								.setMinLength(10)
								.setMaxLength(1024),
						),
				);
			await interaction.showModal(modal);
		} else {
			await createTicketChannel(interaction, ticketConfig, container, null);
		}
	}
}
module.exports = TicketSelectSelectMenu;
