/**
 * @namespace: addons/ticket/modals/tkt-type-step3-submit.js
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
} = require('discord.js');
const { refreshTicketPanel } = require('../helpers');
const { BaseModal } = require('kythia-core');
class TktTypeStep3SubmitModal extends BaseModal {
	modal = {};
	async execute(interaction) {
		const container = this.container;
		const { redis, kythiaConfig, t, helpers, models, logger } = container;
		const { convertColor } = helpers.color;
		const { simpleContainer } = helpers.discord;
		const { TicketConfig } = models;
		await interaction.deferUpdate();
		const cacheKey = `ticket:type-create:${interaction.user.id}`;
		try {
			const messageId = interaction.customId.split(':')[1];
			if (!messageId) throw new Error('Missing messageId in modal customId');
			const step2DataString = await redis.get(cacheKey);
			if (!step2DataString) {
				const desc = await t(
					interaction,
					'ticket.helpers.index.errors.setup_expired',
				);
				return interaction.followUp({
					components: await simpleContainer(interaction, desc, {
						color: 'Red',
					}),
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			}
			const step2Data = JSON.parse(step2DataString);
			const askReason =
				interaction.fields.getTextInputValue('askReason') || null;

			// New: ticket style
			const ticketStyle =
				interaction.fields.getStringSelectValues('ticketStyle')?.[0] ||
				'channel';
			const ticketThreadChannelId =
				interaction.fields.getSelectedChannels('ticketThreadChannelId')?.first()
					?.id || null;

			// Validate: thread style requires a parent channel
			if (ticketStyle === 'thread' && !ticketThreadChannelId) {
				const desc = await t(
					interaction,
					'ticket.helpers.index.errors.thread_channel_required',
				);
				return interaction.followUp({
					components: await simpleContainer(interaction, desc, {
						color: 'Red',
					}),
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			}
			await TicketConfig.create({
				...step2Data,
				guildId: interaction.guild.id,
				askReason: askReason,
				ticketStyle: ticketStyle,
				ticketThreadChannelId: ticketThreadChannelId,
			});
			await refreshTicketPanel(step2Data.panelMessageId, container);
			await redis.del(cacheKey);
			const _accentColor = convertColor(kythiaConfig.bot.color, {
				from: 'hex',
				to: 'decimal',
			});
			const descSuccess = await t(
				interaction,
				'ticket.modals.tkt-type-step3-submit.type_create.success',
				{
					typeName: step2Data.typeName,
				},
			);
			const successContainer = [
				new ContainerBuilder()
					.setAccentColor(
						convertColor('Green', {
							from: 'discord',
							to: 'decimal',
						}),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(`${descSuccess}`),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							await t(interaction, 'common.container.footer', {
								username: interaction.client.user.username,
							}),
						),
					),
			];
			await interaction.channel.messages.edit(messageId, {
				components: successContainer,
			});
		} catch (error) {
			logger.error(
				`Error in tkt-type-step3-submit (Final) handler: ${error.message || error}`,
				{
					label: 'core:modals:tkt-type-step3-submit',
				},
			);
			const errDesc = await t(
				interaction,
				'ticket.helpers.index.errors.generic',
			);
			await interaction.followUp({
				components: await simpleContainer(interaction, errDesc, {
					color: 'Red',
				}),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
	}
}
exports.default = TktTypeStep3SubmitModal;
