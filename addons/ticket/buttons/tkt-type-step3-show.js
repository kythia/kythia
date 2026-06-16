/**
 * @namespace: addons/ticket/buttons/tkt-type-step3-show.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ModalBuilder,
	LabelBuilder,
	ChannelSelectMenuBuilder,
	ChannelType,
	MessageFlags,
	TextInputBuilder,
	TextInputStyle,
	StringSelectMenuBuilder,
} = require('discord.js');

const { BaseButton } = require('kythia-core');

class TktTypeStep3ShowButton extends BaseButton {
	button = {};

	async execute(interaction) {
		const container = this.container;

		const { t, helpers, redis, logger } = container;
		const { simpleContainer } = helpers.discord;

		try {
			const cacheKey = `ticket:type-create:${interaction.user.id}`;
			const cachedData = await redis.get(cacheKey);

			if (!cachedData) {
				const desc = await t(interaction, 'ticket.errors.setup_expired');
				return interaction.reply({
					components: await simpleContainer(interaction, desc, {
						color: 'Red',
					}),
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			}

			const messageId = interaction.message.id;

			const modal = new ModalBuilder()
				.setCustomId(`tkt-type-step3-submit:${messageId}`)
				.setTitle(
					await interaction.client.container.t(
						interaction,
						'ticket.ui.create_type_3',
					),
				)
				.addLabelComponents(
					new LabelBuilder()
						.setLabel(
							await interaction.client.container.t(
								interaction,
								'ticket.ui.ticket_style',
							),
						)
						.setDescription(
							'Channel = new private channel per ticket. Thread = new private thread inside a text channel.',
						)
						.setStringSelectMenuComponent(
							new StringSelectMenuBuilder()
								.setCustomId('ticketStyle')
								.setPlaceholder(
									await interaction.client.container.t(
										interaction,
										'ticket.ui.ph_select_style',
									),
								)
								.addOptions([
									{
										label: 'Channel (Default)',
										description: 'Each ticket opens in its own text channel.',
										value: 'channel',
										default: true,
									},
									{
										label: 'Thread',
										description:
											'Each ticket opens as a thread inside a parent channel.',
										value: 'thread',
									},
								])
								.setMinValues(1)
								.setMaxValues(1),
						),
					new LabelBuilder()
						.setLabel(
							await interaction.client.container.t(
								interaction,
								'ticket.ui.thread_parent',
							),
						)
						.setDescription(
							'Required for Thread style. Tickets will open as threads in this channel.',
						)
						.setChannelSelectMenuComponent(
							new ChannelSelectMenuBuilder()
								.setCustomId('ticketThreadChannelId')
								.setPlaceholder(
									await interaction.client.container.t(
										interaction,
										'ticket.ui.ph_select_thread',
									),
								)
								.addChannelTypes(ChannelType.GuildText)
								.setRequired(false)
								.setMinValues(0)
								.setMaxValues(1),
						),
					new LabelBuilder()
						.setLabel(
							await interaction.client.container.t(
								interaction,
								'ticket.ui.creator_reason',
							),
						)
						.setDescription(
							'If filled, the user will be prompted. If empty, the ticket will be created immediately.',
						)
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId('askReason')
								.setStyle(TextInputStyle.Paragraph)
								.setPlaceholder(
									'Example: What issue are you experiencing? Please explain in detail.',
								)
								.setRequired(false),
						),
				);

			await interaction.showModal(modal);
		} catch (error) {
			logger.error(
				`Error in tkt-type-step3-show handler: ${error.message || error}`,
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

exports.default = TktTypeStep3ShowButton;
