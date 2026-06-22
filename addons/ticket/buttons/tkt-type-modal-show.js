/**
 * @namespace: addons/ticket/buttons/tkt-type-modal-show.js
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
	ChannelType,
	ChannelSelectMenuBuilder,
} = require('discord.js');
const { BaseButton } = require('kythia-core');
class TktTypeModalShowButton extends BaseButton {
	button = {};
	async execute(interaction) {
		const container = this.container;
		const { t, helpers, logger } = container;
		const { simpleContainer } = helpers.discord;
		try {
			const modal = new ModalBuilder()
				.setCustomId('tkt-type-create')
				.setTitle(
					await interaction.client.container.t(
						interaction,
						'ticket.ui.create_type_modal',
					),
				)
				.addLabelComponents(
					new LabelBuilder()
						.setLabel(
							await interaction.client.container.t(
								interaction,
								'ticket.ui.ticket_type_name',
							),
						)
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId('typeName')
								.setStyle(TextInputStyle.Short)
								.setPlaceholder(
									await interaction.client.container.t(
										interaction,
										'ticket.ui.ph_bug_report',
									),
								)
								.setRequired(true),
						),
					new LabelBuilder()
						.setLabel(
							await interaction.client.container.t(
								interaction,
								'ticket.ui.type_emoji',
							),
						)
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId('typeEmoji')
								.setStyle(TextInputStyle.Short)
								.setPlaceholder(
									await interaction.client.container.t(
										interaction,
										'ticket.ui.ph_emoji_2',
									),
								)
								.setRequired(false),
						),
					new LabelBuilder()
						.setLabel(
							await interaction.client.container.t(
								interaction,
								'ticket.ui.channel_category_id',
							),
						)
						.setDescription('Category ID where new tickets are created')
						.setChannelSelectMenuComponent(
							new ChannelSelectMenuBuilder()
								.setCustomId('ticketCategoryId')
								.setPlaceholder(
									await interaction.client.container.t(
										interaction,
										'ticket.ui.ph_select_category',
									),
								)
								.addChannelTypes(ChannelType.GuildCategory)
								.setRequired(true)
								.setMinValues(1)
								.setMaxValues(1),
						),
					new LabelBuilder()
						.setLabel(
							await interaction.client.container.t(
								interaction,
								'ticket.ui.ticket_opening_msg',
							),
						)
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId('ticketOpenMessage')
								.setStyle(TextInputStyle.Paragraph)
								.setPlaceholder(
									'This message will be sent in the new ticket channel. {user} will be mentioned.',
								)
								.setRequired(false),
						),
					new LabelBuilder()
						.setLabel(
							await interaction.client.container.t(
								interaction,
								'ticket.ui.ticket_opening_img',
							),
						)
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId('ticketOpenImage')
								.setStyle(TextInputStyle.Short)
								.setPlaceholder(
									await interaction.client.container.t(
										interaction,
										'ticket.ui.ph_img_ticket',
									),
								)
								.setRequired(false),
						),
				);
			await interaction.showModal(modal);
		} catch (error) {
			logger.error(
				`Error in tkt-type-modal-show handler: ${error.message || error}`,
				{
					label: 'ticket',
				},
			);
			if (!interaction.replied && !interaction.deferred) {
				const desc = await t(
					interaction,
					'ticket.buttons.tkt-type-modal-show.errors.modal_show_failed_type',
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
exports.default = TktTypeModalShowButton;
