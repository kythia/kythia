/**
 * @namespace: addons/tempvoice/buttons/tv-kick.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	MessageFlags,
	ActionRowBuilder,
	ContainerBuilder,
	TextDisplayBuilder,
	UserSelectMenuBuilder,
} = require('discord.js');
const { BaseButton } = require('kythia-core');
class TvKickButton extends BaseButton {
	button = {
		customId: 'tv_kick',
	};
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
				components:
					await interaction.client.container.helpers.discord.simpleContainer(
						interaction,
						await t(
							interaction,
							'tempvoice.buttons.tv-kick.kick.no_active_channel',
						),
						{
							color: 'Red',
						},
					),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
		const selectMenu = new UserSelectMenuBuilder()
			.setCustomId(`tv_kick_menu:${activeChannel.channelId}`)
			.setPlaceholder(
				await t(interaction, 'tempvoice.buttons.tv-kick.kick.menu.placeholder'),
			)
			.setMinValues(1)
			.setMaxValues(1);
		const row = new ActionRowBuilder().addComponents(selectMenu);
		const containerComponent = new ContainerBuilder()
			.setAccentColor(
				convertColor(kythiaConfig.bot.color, {
					from: 'hex',
					to: 'decimal',
				}),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(interaction, 'tempvoice.buttons.tv-kick.kick.menu.content'),
				),
			)
			.addActionRowComponents(row);
		await interaction.reply({
			components: [containerComponent],
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		});
	}
}
exports.default = TvKickButton;
