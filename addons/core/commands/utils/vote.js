/**
 * @namespace: addons/core/commands/utils/vote.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ButtonStyle,
	MessageFlags,
	ButtonBuilder,
	ActionRowBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	MediaGalleryBuilder,
	SlashCommandBuilder,
	SeparatorSpacingSize,
	MediaGalleryItemBuilder,
} = require('discord.js');

module.exports = {
	aliases: ['v'],
	slashCommand: new SlashCommandBuilder()
		.setName('vote')
		.setDescription(`❤️ Vote for kythia on top.gg!`),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, kythiaConfig, helpers } = container;
		const { convertColor } = helpers.color;

		const mainContainer = new ContainerBuilder().setAccentColor(
			convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }),
		);

		if (kythiaConfig.settings?.voteBannerImage) {
			mainContainer.addMediaGalleryComponents(
				new MediaGalleryBuilder().addItems([
					new MediaGalleryItemBuilder().setURL(
						kythiaConfig.settings.voteBannerImage,
					),
				]),
			);
			mainContainer.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			);
		}

		mainContainer
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(interaction, 'core.utils.vote.container.title', {
						username: interaction.client.user.username,
					}),
				),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(interaction, 'core.utils.vote.container.desc', {
						username: interaction.client.user.username,
					}),
				),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addActionRowComponents(
				new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setLabel(
							await t(interaction, 'core.utils.vote.button.topgg', {
								username: interaction.client.user.username,
							}),
						)
						.setStyle(ButtonStyle.Link)
						.setURL(`https://top.gg/bot/${kythiaConfig.bot.clientId}/vote`),
				),
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
			);

		await interaction.reply({
			components: [mainContainer],
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
