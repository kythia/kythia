/**
 * @namespace: addons/ticket/buttons/tkt-type-step2-show.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ModalBuilder,
	LabelBuilder,
	RoleSelectMenuBuilder,
	ChannelSelectMenuBuilder,
	ChannelType,
	MessageFlags,
	TextInputBuilder,
	TextInputStyle,
	StringSelectMenuBuilder,
} = require('discord.js');

module.exports = {
	execute: async (interaction, container) => {
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
				.setCustomId(`tkt-type-step2-submit:${messageId}`)
				.setTitle('Create Type - Step 2/2: Config')
				.addLabelComponents(
					new LabelBuilder()
						.setLabel('Select Staff Role')
						.setRoleSelectMenuComponent(
							new RoleSelectMenuBuilder()
								.setCustomId('staffRoleId')
								.setPlaceholder('Select one role...')
								.setMinValues(1)
								.setMaxValues(1),
						),
					new LabelBuilder()
						.setLabel('Select Log Channel')
						.setChannelSelectMenuComponent(
							new ChannelSelectMenuBuilder()
								.setCustomId('logsChannelId')
								.setPlaceholder('Select one channel...')
								.addChannelTypes(ChannelType.GuildText)
								.setMinValues(1)
								.setMaxValues(1),
						),
					new LabelBuilder()
						.setLabel('Select Transcript Channel')
						.setChannelSelectMenuComponent(
							new ChannelSelectMenuBuilder()
								.setCustomId('transcriptChannelId')
								.setPlaceholder('Select one channel...')
								.addChannelTypes(ChannelType.GuildText)
								.setMinValues(1)
								.setMaxValues(1),
						),
					new LabelBuilder()
						.setLabel('Select Ticket Category (Optional, for Channel style)')
						.setChannelSelectMenuComponent(
							new ChannelSelectMenuBuilder()
								.setCustomId('ticketCategoryId')
								.setPlaceholder('Select a category (optional)...')
								.addChannelTypes(ChannelType.GuildCategory)
								.setRequired(false)
								.setMinValues(0)
								.setMaxValues(1),
						),
					new LabelBuilder()
						.setLabel('Ticket Style')
						.setDescription(
							'Channel = new private channel per ticket. Thread = new private thread inside a text channel.',
						)
						.setStringSelectMenuComponent(
							new StringSelectMenuBuilder()
								.setCustomId('ticketStyle')
								.setPlaceholder('Select ticket style...')
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
						.setLabel('Thread Parent Channel (Required for Thread style)')
						.setDescription(
							'Only used when Ticket Style is set to Thread. Tickets will be opened as threads inside this channel.',
						)
						.setChannelSelectMenuComponent(
							new ChannelSelectMenuBuilder()
								.setCustomId('ticketThreadChannelId')
								.setPlaceholder('Select a text channel for threads...')
								.addChannelTypes(ChannelType.GuildText)
								.setRequired(false)
								.setMinValues(0)
								.setMaxValues(1),
						),
					new LabelBuilder()
						.setLabel('Ticket Creator Reason Question')
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
				`Error in tkt-type-step2-show handler: ${error.message || error}`,
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
	},
};
