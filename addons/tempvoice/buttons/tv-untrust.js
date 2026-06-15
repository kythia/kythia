/**
 * @namespace: addons/tempvoice/buttons/tv_untrust.js
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
class TvUntrustButton extends BaseButton {
	button = {
		customId: 'tv_untrust',
	};
	async execute(interaction) {
		const container = this.container;
		const { models, t, helpers, kythiaConfig } = container;
		const { convertColor } = helpers.color;
		const { TempVoiceChannel } = models;
		const activeChannel = await TempVoiceChannel.getCache({
			ownerId: interaction.user.id,
			guildId: interaction.guild.id,
		});
		if (!activeChannel) {
			return interaction.reply({
				components:
					await interaction.client.container.helpers.discord.simpleContainer(
						interaction,
						await t(interaction, 'tempvoice.untrust.no_active_channel'),
						{
							color: 'Red',
						},
					),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
		const selectMenu = new UserSelectMenuBuilder()
			.setCustomId(`tv_untrust_menu:${activeChannel.channelId}`)
			.setPlaceholder(
				await t(interaction, 'tempvoice.untrust.menu.placeholder'),
			)
			.setMinValues(1)
			.setMaxValues(10);
		const row = new ActionRowBuilder().addComponents(selectMenu);
		const accentColor = convertColor(kythiaConfig.bot.color, {
			from: 'hex',
			to: 'decimal',
		});
		const containerComponent = new ContainerBuilder()
			.setAccentColor(accentColor)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(interaction, 'tempvoice.untrust.menu.content'),
				),
			)
			.addActionRowComponents(row);
		await interaction.reply({
			components: [containerComponent],
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		});
	}
}
exports.default = TvUntrustButton;
