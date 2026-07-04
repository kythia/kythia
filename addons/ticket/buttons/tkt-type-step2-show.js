/**
 * @namespace: addons/ticket/buttons/tkt-type-step2-show.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ChannelType,
	LabelBuilder,
	MessageFlags,
	ModalBuilder,
	RoleSelectMenuBuilder,
	ChannelSelectMenuBuilder,
} = require('discord.js');
const { BaseButton } = require('kythia-core');
class TktTypeStep2ShowButton extends BaseButton {
	button = {};
	async execute(interaction) {
		const container = this.container;
		const { t, helpers, redis, logger } = container;
		const { simpleContainer } = helpers.discord;
		try {
			const cacheKey = `ticket:type-create:${interaction.user.id}`;
			const cachedData = await redis.get(cacheKey);
			if (!cachedData) {
				const desc = await t(
					interaction,
					'ticket.helpers.index.errors.setup_expired',
				);
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
				.setTitle(
					await interaction.client.container.t(
						interaction,
						'ticket.ui.create_type_2',
					),
				)
				.addLabelComponents(
					new LabelBuilder()
						.setLabel(
							await interaction.client.container.t(
								interaction,
								'ticket.ui.select_staff',
							),
						)
						.setRoleSelectMenuComponent(
							new RoleSelectMenuBuilder()
								.setCustomId('staffRoleId')
								.setPlaceholder(
									await interaction.client.container.t(
										interaction,
										'ticket.ui.ph_select_role',
									),
								)
								.setMinValues(1)
								.setMaxValues(1),
						),
					new LabelBuilder()
						.setLabel(
							await interaction.client.container.t(
								interaction,
								'ticket.ui.select_log',
							),
						)
						.setChannelSelectMenuComponent(
							new ChannelSelectMenuBuilder()
								.setCustomId('logsChannelId')
								.setPlaceholder(
									await interaction.client.container.t(
										interaction,
										'ticket.ui.ph_select_channel',
									),
								)
								.addChannelTypes(ChannelType.GuildText)
								.setMinValues(1)
								.setMaxValues(1),
						),
					new LabelBuilder()
						.setLabel(
							await interaction.client.container.t(
								interaction,
								'ticket.ui.select_transcript',
							),
						)
						.setChannelSelectMenuComponent(
							new ChannelSelectMenuBuilder()
								.setCustomId('transcriptChannelId')
								.setPlaceholder(
									await interaction.client.container.t(
										interaction,
										'ticket.ui.ph_select_channel',
									),
								)
								.addChannelTypes(ChannelType.GuildText)
								.setMinValues(1)
								.setMaxValues(1),
						),
					new LabelBuilder()
						.setLabel(
							await interaction.client.container.t(
								interaction,
								'ticket.ui.ticket_category',
							),
						)
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
								.setRequired(false)
								.setMinValues(0)
								.setMaxValues(1),
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
				const desc = await t(
					interaction,
					'ticket.helpers.index.errors.modal_show_failed',
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
exports.default = TktTypeStep2ShowButton;
