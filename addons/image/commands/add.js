/**
 * @namespace: addons/image/commands/add.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const path = require('node:path');
const { uploadToR2 } = require('../services/r2');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('add')
			.setDescription('Add a new image')
			.addAttachmentOption((option) =>
				option
					.setName('image')
					.setDescription('The image to add')
					.setRequired(true),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { models, helpers, t, kythiaConfig } = container;
		const { Image } = models;
		const { simpleContainer } = helpers.discord;

		// R2 credentials — configure these in kythia.config.js under addons.image
		const r2Config = kythiaConfig.addons.image;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const attachment = interaction.options.getAttachment('image');

		// Validate that the attachment is an image
		if (!attachment.contentType?.startsWith('image/')) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'image.add.invalid.type.desc'),
				{ color: kythiaConfig.bot.color },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		try {
			// 1. Download the image from Discord's CDN into a Buffer
			const response = await fetch(attachment.url);
			if (!response.ok) {
				throw new Error(
					`Failed to fetch image from Discord: ${response.status}`,
				);
			}
			const arrayBuffer = await response.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);

			// 2. Build a unique storage key so filenames never collide.
			//    Format: images/<userId>/<uuid><ext>
			//    Example: images/123456789/f47ac10b-png
			const ext = path.extname(attachment.name).toLowerCase() || '.png';
			const uniqueKey = `images/${interaction.user.id}/${uuidv4()}${ext}`;

			// 3. Upload the Buffer to Cloudflare R2
			const { key, publicUrl } = await uploadToR2(
				buffer,
				uniqueKey,
				attachment.name,
				r2Config,
			);

			// 4. Persist metadata to the database
			const savedImage = await Image.create({
				userId: interaction.user.id,
				filename: key, // R2 object key (used for deletion)
				originalName: attachment.name,
				fileId: key, // Reuse key as the stable identifier
				storageUrl: publicUrl, // Public R2 URL
				mimetype: attachment.contentType,
				fileSize: attachment.size,
			});

			// 5. Reply with the public image URL
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'image.add.success.desc', {
					url: savedImage.storageUrl,
				}),
				{ color: kythiaConfig.bot.color },
			);

			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (err) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'image.add.error.upload_failed', {
					error: err instanceof Error ? err.message : 'Unknown error',
				}),
				{ color: kythiaConfig.bot.color },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	},
};
