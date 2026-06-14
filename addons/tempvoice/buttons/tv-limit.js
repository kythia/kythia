/**
 * @namespace: addons/tempvoice/buttons/tv_limit.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ActionRowBuilder,
	MessageFlags,
} = require('discord.js');

const { BaseButton } = require('kythia-core');

class TvLimitButton extends BaseButton {
	button = {};

	async execute(interaction) {
		const container = this.container;

		const { models, t } = container;
		const { TempVoiceChannel } = models;
		const ownerId = interaction.user.id;

		const activeChannel = await TempVoiceChannel.getCache({
			ownerId: ownerId,
			guildId: interaction.guild.id,
		});

		if (!activeChannel) {
			return interaction.reply({
				content: await t(interaction, 'tempvoice.limit.no_active_channel'),
				flags: MessageFlags.Ephemeral,
			});
		}

		const channelId = activeChannel.channelId;

		const modal = new ModalBuilder()
			.setCustomId(`tv_limit_modal:${channelId}`)
			.setTitle(await t(interaction, 'tempvoice.limit.modal_title'));

		const limitInput = new TextInputBuilder()
			.setCustomId('user_limit')
			.setLabel(await t(interaction, 'tempvoice.limit.label'))
			.setStyle(TextInputStyle.Short)
			.setPlaceholder(await t(interaction, 'tempvoice.limit.placeholder'))
			.setRequired(true);

		const row = new ActionRowBuilder().addComponents(limitInput);
		modal.addComponents(row);

		await interaction.showModal(modal);
	}
}

exports.default = TvLimitButton;
