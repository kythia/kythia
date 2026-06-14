/**
 * @namespace: addons/tempvoice/buttons/tv_transfer.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	ActionRowBuilder,
	UserSelectMenuBuilder,
	ContainerBuilder,
	TextDisplayBuilder,
	MessageFlags,
} = require('discord.js');

const { BaseButton } = require('kythia-core');

class TvTransferButton extends BaseButton {
	button = {};

	async execute(interaction) {
		const container = this.container;

		const { models, t, helpers, kythiaConfig } = container;
		const { TempVoiceChannel } = models;
		const { convertColor } = helpers.color;

		const activeChannel = await TempVoiceChannel.getCache({
			ownerId: interaction.user.id,
			guildId: interaction.guild.id,
		});
		if (!activeChannel) {
			return interaction.reply({
				content: await t(interaction, 'tempvoice.transfer.no_active_channel'),
				flags: MessageFlags.Ephemeral,
			});
		}

		const selectMenu = new UserSelectMenuBuilder()
			.setCustomId(`tv_transfer_menu:${activeChannel.channelId}`)
			.setPlaceholder(
				await t(interaction, 'tempvoice.transfer.menu.placeholder'),
			)
			.setMinValues(1)
			.setMaxValues(1);

		const row = new ActionRowBuilder().addComponents(selectMenu);
		const accentColor = convertColor(kythiaConfig.bot.color, {
			from: 'hex',
			to: 'decimal',
		});

		const containerComponent = new ContainerBuilder()
			.setAccentColor(accentColor)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(interaction, 'tempvoice.transfer.menu.content'),
				),
			)
			.addActionRowComponents(row);

		await interaction.reply({
			components: [containerComponent],
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		});
	}
}

module.exports = TvTransferButton;
