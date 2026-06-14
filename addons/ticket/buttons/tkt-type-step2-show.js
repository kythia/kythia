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
				.setTitle('Create Type - Step 2/3: Core Config')
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
						.setLabel('Ticket Category (Optional, Channel Style)')
						.setChannelSelectMenuComponent(
							new ChannelSelectMenuBuilder()
								.setCustomId('ticketCategoryId')
								.setPlaceholder('Select a category (optional)...')
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

exports.default = TktTypeStep2ShowButton;
