/**
 * @namespace: addons/ticket/buttons/tkt-type-step1-show.js
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
	StringSelectMenuBuilder,
	MessageFlags,
} = require('discord.js');

const { BaseButton } = require('kythia-core');

class TktTypeStep1ShowButton extends BaseButton {
	button = {};

	async execute(interaction) {
		const container = this.container;

		const { t, helpers, models, logger } = container;
		const { simpleContainer, getTextChannelSafe } = helpers.discord;
		const { TicketPanel } = models;

		try {
			const messageId = interaction.message.id;

			const panels = await TicketPanel.getAllCache({
				guildId: interaction.guild.id,
			});
			if (!panels || panels.length === 0) {
				const desc = await t(interaction, 'ticket.errors.no_panels_found');
				return interaction.reply({
					components: await simpleContainer(interaction, desc, {
						color: 'Red',
					}),
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			}

			const panelOptions = await Promise.all(
				panels.map(async (panel) => {
					let channelName = panel.channelId;
					try {
						const channel = await getTextChannelSafe(
							interaction.guild,
							panel.channelId,
						);
						if (channel?.name) channelName = channel.name;
					} catch (_) {}
					return {
						label: panel.title ? panel.title.slice(0, 100) : 'Untitled Panel',
						description: `Panel in #${channelName}`,
						value: panel.messageId,
					};
				}),
			);

			const modal = new ModalBuilder()
				.setCustomId(`tkt-type-step1-submit:${messageId}`)
				.setTitle(
					await interaction.client.container.t(
						interaction,
						'ticket.ui.create_type_1',
					),
				)
				.addLabelComponents(
					new LabelBuilder()
						.setLabel(
							await interaction.client.container.t(
								interaction,
								'ticket.ui.select_target_panel',
							),
						)
						.setStringSelectMenuComponent(
							new StringSelectMenuBuilder()
								.setCustomId('panelId')
								.setPlaceholder(
									await interaction.client.container.t(
										interaction,
										'ticket.ui.ph_select_panel',
									),
								)
								.addOptions(panelOptions)
								.setMinValues(1)
								.setMaxValues(1),
						),
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
										'ticket.ui.ph_emoji',
									),
								)
								.setRequired(false),
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
									'This message will be sent in the new ticket channel.',
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
										'ticket.ui.ph_img_url',
									),
								)
								.setRequired(false),
						),
				);

			await interaction.showModal(modal);
		} catch (error) {
			logger.error(
				`Error in tkt-type-step1-show handler: ${error.message || error}`,
				{
					label: 'ticket',
				},
			);
			if (!interaction.replied && !interaction.deferred) {
				const desc = await t(interaction, 'ticket.errors.modal_show_failed');
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

exports.default = TktTypeStep1ShowButton;
