/**
 * @namespace: addons/image/commands/delete.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { deleteFromR2 } = require('../services/r2');
const { BaseCommand } = require('kythia-core');
class DeleteCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('delete')
			.setDescription('Delete an image by its code')
			.addStringOption((option) =>
				option
					.setName('code')
					.setDescription('The code of the image to delete')
					.setRequired(true),
			);
	async execute(interaction) {
		const container = this.container;
		const { models, t, kythiaConfig, helpers } = container;
		const { Image } = models;
		const { simpleContainer } = helpers.discord;

		// R2 credentials — configure these in kythia.config.js under addons.image
		const r2Config = kythiaConfig.addons.image;
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});
		const code = interaction.options.getString('code');

		// Look up the image record by the user's own uploads
		const image = await Image.getCache({
			userId: interaction.user.id,
			filename: code,
		});
		if (!image) {
			const components = await simpleContainer(
				interaction,
				`${await t(interaction, 'image.commands.delete.not.found.desc')}`,
				{
					color: kythiaConfig.bot.color,
				},
			);
			return await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		try {
			// 1. Delete the object from Cloudflare R2 using the stored key.
			//    `image.filename` holds the R2 object key (e.g. "images/<userId>/<uuid>.png").
			await deleteFromR2(image.filename, r2Config);

			// 2. Remove the database record
			await image.destroy();
			const components = await simpleContainer(
				interaction,
				`${await t(interaction, 'image.commands.delete.success.desc')}`,
				{
					color: kythiaConfig.bot.color,
				},
			);
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (err) {
			const components = await simpleContainer(
				interaction,
				`❌ **Failed to delete image:** ${err instanceof Error ? err.message : 'Unknown error'}`,
				{
					color: kythiaConfig.bot.color,
				},
			);
			return await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}
exports.default = DeleteCommand;
