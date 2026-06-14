/**
 * @namespace: addons/ticket/modals/tkt-type-step1-submit.js
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

class TktTypeStep1SubmitModal extends BaseModal {
	modal = {};

	async execute(interaction) {
		const container = this.container;

		const { redis, kythiaConfig, t, helpers, logger } = container;
		const { convertColor } = helpers.color;
		const { simpleContainer } = helpers.discord;

		await interaction.deferUpdate();

		try {
			const messageId = interaction.customId.split(':')[1];
			if (!messageId) {
				const desc = await t(interaction, 'ticket.errors.no_message_id');
				return interaction.followUp({
					components: await simpleContainer(interaction, desc, {
						color: 'Red',
					}),
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			}

			const panelMessageId =
				interaction.fields.getStringSelectValues('panelId')[0]; //

			const typeName = interaction.fields.getTextInputValue('typeName');
			const typeEmoji = interaction.fields.getTextInputValue('typeEmoji');
			const ticketOpenMessage =
				interaction.fields.getTextInputValue('ticketOpenMessage');
			const ticketOpenImage =
				interaction.fields.getTextInputValue('ticketOpenImage');

			const cacheKey = `ticket:type-create:${interaction.user.id}`;
			const step1Data = {
				panelMessageId,
				typeName,
				typeEmoji: typeEmoji || null,
				ticketOpenMessage: ticketOpenMessage || null,
				ticketOpenImage: ticketOpenImage || null,
			};
			await redis.set(cacheKey, JSON.stringify(step1Data), 'EX', 1800);

			const accentColor = convertColor(kythiaConfig.bot.color, {
				from: 'hex',
				to: 'decimal',
			});
			const nextButton = new ButtonBuilder()
				.setCustomId('tkt-type-step2-show')
				.setLabel(await t(interaction, 'ticket.type.next_button'))
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('🎟️');

			const components = [
				new ContainerBuilder()
					.setAccentColor(accentColor)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							await t(interaction, 'ticket.type.step2_title'),
						),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							await t(interaction, 'ticket.type.step2_desc'),
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
				`Error in tkt-type-step1-submit handler: ${error.message || error}`,
				{
					label: 'core:modals:tkt-type-step1-submit',
				},
			);
			const desc = await t(interaction, 'ticket.errors.generic');
			await interaction.followUp({
				components: await simpleContainer(interaction, desc, { color: 'Red' }),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
	}
}

exports.default = TktTypeStep1SubmitModal;
