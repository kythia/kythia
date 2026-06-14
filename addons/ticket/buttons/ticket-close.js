/**
 * @namespace: addons/ticket/buttons/ticket-close.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	ContainerBuilder,
	TextDisplayBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	MessageFlags,
	SeparatorBuilder,
	SeparatorSpacingSize,
} = require('discord.js');

const { BaseButton } = require('kythia-core');

class TicketCloseButton extends BaseButton {
	button = {};

	async execute(interaction) {
		const container = this.container;

		const { t, helpers, kythiaConfig } = container;
		const { convertColor } = helpers.color;

		const accentColor = convertColor(kythiaConfig.bot.color, {
			from: 'hex',
			to: 'decimal',
		});

		const row = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId('ticket-confirm-close')
				.setLabel(await t(interaction, 'ticket.close.confirm_button'))
				.setStyle(ButtonStyle.Danger)
				.setEmoji('✅'),
			new ButtonBuilder()
				.setCustomId('ticket-close-with-reason')
				.setLabel(await t(interaction, 'ticket.v2.close_with_reason_button'))
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('🔏'),
			new ButtonBuilder()
				.setCustomId('ticket-cancel-close')
				.setLabel(await t(interaction, 'ticket.close.cancel_button'))
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('❌'),
		);

		const confirmContainer = new ContainerBuilder()
			.setAccentColor(accentColor)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(interaction, 'ticket.close.confirm_title'),
				),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(interaction, 'ticket.close.confirm_desc'),
				),
			)
			.addActionRowComponents(row)
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
			);

		await interaction.reply({
			components: [confirmContainer],
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		});
	}
}

exports.default = TicketCloseButton;
