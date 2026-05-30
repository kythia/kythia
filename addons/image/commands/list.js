/**
 * @namespace: addons/image/commands/list.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
} = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand.setName('list').setDescription('List all your uploaded images'),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { models, helpers, t, kythiaConfig } = container;
		const { Image } = models;
		const { convertColor } = helpers.color;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		let images = await Image.getAllCache({
			where: { userId: interaction.user.id },
		});

		if (!Array.isArray(images)) {
			images = Array.isArray(images?.rows) ? images.rows : [];
		}
		if (!images.length) {
			return interaction.editReply(
				await t(interaction, 'image.commands.list.empty'),
			);
		}

		const items = images.map((img) => ({
			code: img.filename,
			url: img.storageUrl,
		}));
		const color = convertColor(kythiaConfig.bot.color, {
			from: 'hex',
			to: 'decimal',
		});

		const chunkSize = 25;
		for (let i = 0; i < items.length; i += chunkSize) {
			const pageItems = items.slice(i, i + chunkSize);

			const container = new ContainerBuilder()
				.setAccentColor(color)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						i === 0
							? await t(interaction, 'image.commands.list.title.text')
							: await t(interaction, 'image.commands.list.title.empty'),
					),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				);

			for (const img of pageItems) {
				container.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await t(interaction, 'image.commands.list.item', {
							code: img.code,
							url: img.url,
						}),
					),
				);
				container.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(false),
				);
			}

			if (i + chunkSize >= items.length) {
				container.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				);
				container.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await t(interaction, 'image.commands.list.footer.help'),
					),
				);
			}
			container
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

			if (i === 0) {
				await interaction.editReply({
					components: [container],
					flags: MessageFlags.IsComponentsV2,
				});
			} else {
				await interaction.followUp({
					components: [container],
					flags: MessageFlags.IsComponentsV2,
				});
			}
		}
	},
};
