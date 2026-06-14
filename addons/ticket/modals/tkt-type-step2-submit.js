/**
 * @namespace: addons/ticket/modals/tkt-type-step2-submit.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	MessageFlags,
	SeparatorSpacingSize,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
} = require('discord.js');

const { BaseModal } = require('kythia-core');

class TktTypeStep2SubmitModal extends BaseModal {
	modal = {};

	async execute(interaction) {
		const container = this.container;

		const { redis, kythiaConfig, t, helpers, logger } = container;
		const { convertColor } = helpers.color;
		const { simpleContainer } = helpers.discord;

		await interaction.deferUpdate();
		const cacheKey = `ticket:type-create:${interaction.user.id}`;

		try {
			const messageId = interaction.customId.split(':')[1];
			if (!messageId) throw new Error('Missing messageId in modal customId');

			const step1DataString = await redis.get(cacheKey);
			if (!step1DataString) {
				const desc = await t(interaction, 'ticket.errors.setup_expired');
				return interaction.followUp({
					components: await simpleContainer(interaction, desc, {
						color: 'Red',
					}),
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			}
			const step1Data = JSON.parse(step1DataString);

			const staffRoleId = interaction.fields
				.getSelectedRoles('staffRoleId')
				?.first()?.id;
			const logsChannelId = interaction.fields
				.getSelectedChannels('logsChannelId')
				?.first()?.id;
			const transcriptChannelId = interaction.fields
				.getSelectedChannels('transcriptChannelId')
				?.first()?.id;
			const ticketCategoryId = interaction.fields
				.getSelectedChannels('ticketCategoryId')
				?.first()?.id;

			const step2Data = {
				...step1Data,
				staffRoleId,
				logsChannelId,
				transcriptChannelId,
				ticketCategoryId: ticketCategoryId || null,
			};
			await redis.set(cacheKey, JSON.stringify(step2Data), 'EX', 1800);

			const accentColor = convertColor(kythiaConfig.bot.color, {
				from: 'hex',
				to: 'decimal',
			});
			const nextButton = new ButtonBuilder()
				.setCustomId('tkt-type-step3-show')
				.setLabel(await t(interaction, 'ticket.type.next_button_step3'))
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('🎟️');

			const components = [
				new ContainerBuilder()
					.setAccentColor(accentColor)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							await t(interaction, 'ticket.type.step3_title'),
						),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							await t(interaction, 'ticket.type.step3_desc'),
						),
					)
					.addSeparatorComponents(
						new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small),
					)
					.addActionRowComponents(
						new ActionRowBuilder().addComponents(nextButton),
					),
			];

			await interaction.channel.messages.edit(messageId, {
				components: components,
			});
		} catch (error) {
			logger.error(
				`Error in tkt-type-step2-submit (Final) handler: ${error.message || error}`,
				{
					label: 'core:modals:tkt-type-step2-submit',
				},
			);
			const errDesc = await t(interaction, 'ticket.errors.generic');
			await interaction.followUp({
				components: await simpleContainer(interaction, errDesc, {
					color: 'Red',
				}),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
	}
}

exports.default = TktTypeStep2SubmitModal;
