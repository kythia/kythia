/**
 * @namespace: addons/ai/commands/imagen.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	SlashCommandBuilder,
	AttachmentBuilder,
	ContainerBuilder,
	TextDisplayBuilder,
	MediaGalleryBuilder,
	MediaGalleryItemBuilder,
} = require('discord.js');
const { GoogleGenAI } = require('@google/genai');
const fs = require('node:fs').promises;
const path = require('node:path');
const https = require('node:https');
const http = require('node:http');

const tempDirPath = path.join(__dirname, '..', 'temp');
const usageFilePath = path.join(tempDirPath, 'imagen_usage.json');

async function ensureUsageFile() {
	try {
		await fs.mkdir(tempDirPath, { recursive: true });
	} catch (_e) {}
	try {
		await fs.access(usageFilePath);
	} catch (_e) {
		await fs.writeFile(usageFilePath, JSON.stringify({}));
	}
}

async function checkAndUseLimit(userId, limit) {
	await ensureUsageFile();
	let data = {};
	try {
		const raw = await fs.readFile(usageFilePath, 'utf-8');
		data = JSON.parse(raw);
	} catch (_e) {
		data = {};
	}

	const today = new Date().toISOString().split('T')[0];

	if (!data[userId]) data[userId] = { date: today, count: 0 };

	// Reset if different day
	if (data[userId].date !== today) {
		data[userId] = { date: today, count: 0 };
	}

	if (data[userId].count >= limit) {
		return false;
	}

	data[userId].count += 1;
	await fs.writeFile(usageFilePath, JSON.stringify(data, null, 2));
	return true;
}

/**
 * Fetches a URL and returns the response body as a base64-encoded string.
 * @param {string} url
 * @returns {Promise<string>}
 */
function fetchUrlAsBase64(url) {
	return new Promise((resolve, reject) => {
		const client = url.startsWith('https') ? https : http;
		client
			.get(url, (res) => {
				const chunks = [];
				res.on('data', (chunk) => chunks.push(chunk));
				res.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
				res.on('error', reject);
			})
			.on('error', reject);
	});
}

module.exports = {
	voteLocked: true,
	slashCommand: new SlashCommandBuilder()
		.setName('imagen')
		.setDescription(
			'🎨 Generate an image from a prompt or transform an existing image using Gemini AI.',
		)
		.addStringOption((option) =>
			option
				.setName('prompt')
				.setDescription(
					'What do you want to generate or how to transform the image?',
				)
				.setRequired(false),
		)
		.addAttachmentOption((option) =>
			option
				.setName('image')
				.setDescription('Optional source image to transform (image-to-image).')
				.setRequired(false),
		),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, kythiaConfig, helpers, logger } = container;
		const { simpleContainer, isOwner } = helpers.discord;
		const { convertColor } = helpers.color;

		const prompt = interaction.options.getString('prompt');
		const imageAttachment = interaction.options.getAttachment('image');

		// Must provide at least a prompt or an image
		if (!prompt && !imageAttachment) {
			return interaction.reply({
				content: await t(interaction, 'ai.imagen.no_input'),
				flags: MessageFlags.Ephemeral,
			});
		}

		// Validate attachment is an image
		if (imageAttachment && !imageAttachment.contentType?.startsWith('image/')) {
			return interaction.reply({
				content: await t(interaction, 'ai.imagen.invalid_attachment'),
				flags: MessageFlags.Ephemeral,
			});
		}

		await interaction.deferReply();

		const userId = interaction.user.id;
		const limit = kythiaConfig.addons.ai.imagenLimit || 2;

		const canUse = await checkAndUseLimit(userId, limit);

		if (!canUse && !isOwner(userId)) {
			const msg = await t(interaction, 'ai.imagen.limit', { limit });
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		logger.debug(
			`🧠 AI imagen request from ${userId} (image-to-image: ${!!imageAttachment})...`,
			{ label: 'ai' },
		);

		// Send initial loading message using simpleContainer
		const initMsg = imageAttachment
			? await t(interaction, 'ai.imagen.loading_transform', {
					prompt: prompt || '',
				})
			: await t(interaction, 'ai.imagen.loading');
		const initComponents = await simpleContainer(interaction, initMsg);
		await interaction.editReply({
			components: initComponents,
			flags: MessageFlags.IsComponentsV2,
		});

		// Fetch the source image if provided
		let sourceImageBase64 = null;
		let sourceImageMimeType = null;
		if (imageAttachment) {
			try {
				sourceImageBase64 = await fetchUrlAsBase64(imageAttachment.url);
				sourceImageMimeType = imageAttachment.contentType || 'image/png';
			} catch (fetchError) {
				logger.error(`Failed to fetch source image: ${fetchError.message}`, {
					label: 'ai',
				});
				const components = await simpleContainer(
					interaction,
					await t(interaction, 'ai.imagen.fetch_error'),
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		}

		// Resolve the API key pool: dedicated imagenApiKeys > fallback to geminiApiKeys
		const rawImagenKeys = kythiaConfig.addons.ai.imagenApiKeys;
		const rawFallbackKeys = kythiaConfig.addons.ai.geminiApiKeys;
		const imagenKeys = (rawImagenKeys || rawFallbackKeys || '')
			.split(',')
			.map((k) => k.trim())
			.filter(Boolean);

		if (imagenKeys.length === 0) {
			const msg = await t(interaction, 'ai.imagen.rate_limit');
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		let success = false;
		let finalBuffer = null;
		let lastError = null;

		for (let attempt = 0; attempt < imagenKeys.length; attempt++) {
			const GEMINI_API_KEY = imagenKeys[attempt];
			if (!GEMINI_API_KEY) continue;

			const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

			// Build prompt contents
			const contents = [];
			if (prompt) {
				contents.push({ text: prompt });
			} else if (sourceImageBase64) {
				// No prompt but image provided — ask for a recreated/enhanced version
				contents.push({ text: 'Recreate or enhance this image.' });
			}
			if (sourceImageBase64) {
				contents.push({
					inlineData: {
						mimeType: sourceImageMimeType,
						data: sourceImageBase64,
					},
				});
			}

			try {
				const response = await ai.models.generateContent({
					model:
						kythiaConfig.addons.ai.imagenModel ||
						'gemini-3.1-flash-image-preview',
					contents,
				});

				const parts = response.candidates?.[0]?.content?.parts;
				if (parts) {
					for (const part of parts) {
						if (part.inlineData) {
							finalBuffer = Buffer.from(part.inlineData.data, 'base64');
							success = true;
							break;
						}
					}
				}

				if (success) {
					logger.debug(
						`✅ AI imagen request successful on attempt ${attempt + 1}`,
						{
							label: 'ai',
						},
					);
					break;
				} else {
					throw new Error(
						'No inlineData found in response parts. The AI might have refused the prompt.',
					);
				}
			} catch (error) {
				lastError = error;
				logger.error(
					`Error in /imagen attempt ${attempt + 1}: ${error.message || error}`,
					{ label: 'ai' },
				);
				// Stop retrying if the error is safety-related
				if (
					error.message &&
					(error.message.includes('safety') ||
						error.message.includes('blocked'))
				) {
					break;
				}
			}
		}

		if (success && finalBuffer) {
			const attachment = new AttachmentBuilder(finalBuffer, {
				name: 'imagen.png',
			});

			const msgContent = imageAttachment
				? await t(interaction, 'ai.imagen.result_transform', {
						prompt: prompt || '',
					})
				: await t(interaction, 'ai.imagen.result', { prompt: prompt || '' });
			const finalComponents = [
				new ContainerBuilder()
					.setAccentColor(
						convertColor(kythiaConfig.bot.color, {
							from: 'hex',
							to: 'decimal',
						}),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(msgContent),
					)
					.addMediaGalleryComponents(
						new MediaGalleryBuilder().addItems([
							new MediaGalleryItemBuilder().setURL('attachment://imagen.png'),
						]),
					),
			];

			await interaction.editReply({
				components: finalComponents,
				files: [attachment],
				flags: MessageFlags.IsComponentsV2,
			});
		} else {
			// Refund limit if failed
			try {
				const data = JSON.parse(await fs.readFile(usageFilePath, 'utf-8'));
				if (data[userId] && data[userId].count > 0) {
					data[userId].count -= 1;
					await fs.writeFile(usageFilePath, JSON.stringify(data, null, 2));
				}
			} catch (_e) {}

			const valError = lastError
				? lastError.message || lastError
				: 'Unknown error.';
			const msg = await t(interaction, 'ai.imagen.error', { error: valError });
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	},
};
