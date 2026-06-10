/**
 * @namespace: addons/ai/helpers/MediaProcessor.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { GoogleGenAI, createPartFromUri } = require('@google/genai');
const fs = require('node:fs').promises;
const path = require('node:path');

/**
 * MediaProcessor
 * Handles processing of media attachments (images, videos, audio, PDFs, YouTube URLs).
 */
class MediaProcessor {
	/**
	 * @param {Object} dependencies
	 * @param {string} dependencies.tempDir - Temporary directory for file processing
	 * @param {Object} dependencies.logger - Logger instance
	 * @param {string} dependencies.geminiApiKey - Gemini API key for file uploads
	 */
	constructor({ tempDir, logger, geminiApiKey }) {
		this.tempDir = tempDir;
		this.logger = logger;
		this.geminiApiKey = geminiApiKey;

		// Ensure temp directory exists
		this._ensureTempDir();
	}

	/**
	 * Ensure temporary directory exists
	 * @private
	 */
	async _ensureTempDir() {
		try {
			await fs.mkdir(this.tempDir, { recursive: true });
		} catch (_e) {
			// Directory already exists or error creating it
		}
	}

	/**
	 * Process all attachments from a message
	 * @param {import('discord.js').Message} message - Discord message
	 * @returns {Promise<Array>} Array of media parts
	 */
	async processAttachments(message) {
		const mediaParts = [];

		if (message.attachments && message.attachments.size > 0) {
			for (const attachment of message.attachments.values()) {
				if (attachment.contentType?.startsWith('image/')) {
					const imagePart = await this.processImage(attachment);
					if (imagePart) mediaParts.push(imagePart);
				} else if (
					attachment.contentType?.startsWith('video/') ||
					attachment.contentType?.startsWith('audio/')
				) {
					const videoPart = await this.processVideoOrAudio(attachment);
					if (videoPart) mediaParts.push(videoPart);
				} else if (
					attachment.contentType?.startsWith('application/pdf') ||
					attachment.contentType?.startsWith('text/') ||
					attachment.contentType?.startsWith('application/json') ||
					attachment.contentType?.startsWith('application/xml') ||
					attachment.contentType?.startsWith('application/javascript')
				) {
					const docPart = await this.processDocument(attachment);
					if (docPart) mediaParts.push(docPart);
				}
			}
		}

		return mediaParts;
	}

	/**
	 * Process image attachment
	 * @param {import('discord.js').Attachment} attachment - Discord attachment
	 * @returns {Promise<Object|null>} Inline data part or null on error
	 */
	async processImage(attachment) {
		try {
			if (attachment.size > 10 * 1024 * 1024) {
				// 10MB
				this.logger.warn(
					`🖼️ Image too large, skipping: ${attachment.name} (${attachment.size} bytes)`,
					{ label: 'ai' },
				);
				return null;
			}

			this.logger.info(`🖼️ Image detected: ${attachment.name}...`, {
				label: 'ai',
			});
			const res = await fetch(attachment.url);
			if (!res.ok) {
				throw new Error(`HTTP ${res.status}: ${res.statusText}`);
			}
			const arrayBuffer = await res.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			const base64Image = buffer.toString('base64');

			return {
				inlineData: {
					mimeType: attachment.contentType
						? attachment.contentType.split(';')[0].trim()
						: 'image/png',
					data: base64Image,
				},
			};
		} catch (err) {
			this.logger.error(`Error processing image: ${err.message || err}`, {
				label: 'media processor',
			});
			return null;
		}
	}

	/**
	 * Process video or audio attachment
	 * @param {import('discord.js').Attachment} attachment - Discord attachment
	 * @returns {Promise<Object|null>} File part or null on error
	 */
	async processVideoOrAudio(attachment) {
		try {
			if (attachment.size > 30 * 1024 * 1024) {
				// 30MB
				this.logger.warn(
					`🎛️ Media too large, skipping: ${attachment.name} (${attachment.size} bytes)`,
					{ label: 'ai' },
				);
				return null;
			}

			this.logger.info(
				`🎛️ ${attachment.contentType} detected: ${attachment.name}...`,
				{ label: 'ai' },
			);

			const fetchRes = await fetch(attachment.url);
			if (!fetchRes.ok) {
				throw new Error(`HTTP ${fetchRes.status}: ${fetchRes.statusText}`);
			}
			const buffer = Buffer.from(await fetchRes.arrayBuffer());
			const tmp = require('tmp');
			const { promises: fsp } = require('node:fs');

			const tmpobj = tmp.fileSync({
				postfix: path.extname(attachment.name || '.mp4'),
				tmpdir: this.tempDir,
			});
			await fsp.writeFile(tmpobj.name, buffer);

			let uploadedFile;
			this.logger.info(
				`📤 Uploading ${attachment.contentType}: ${attachment.name}...`,
				{ label: 'ai' },
			);

			try {
				uploadedFile = await new GoogleGenAI({
					apiKey: this.geminiApiKey,
				}).files.upload({
					file: tmpobj.name,
					config: {
						mimeType: attachment.contentType
							? attachment.contentType.split(';')[0].trim()
							: 'video/mp4',
					},
				});
			} catch (uploadErr) {
				if (uploadErr?.details?.includes?.('not in an ACTIVE state')) {
					this.logger.warn(`File not active, retrying upload...`, {
						label: 'ai',
					});
					await new Promise((res) => setTimeout(res, 2000));
					uploadedFile = await new GoogleGenAI({
						apiKey: this.geminiApiKey,
					}).files.upload({
						file: tmpobj.name,
						config: {
							mimeType: attachment.contentType
								? attachment.contentType.split(';')[0].trim()
								: 'video/mp4',
						},
					});
				} else {
					throw uploadErr;
				}
			}

			this.logger.info(
				`⏳ Waiting for file ${uploadedFile.name} to become active...`,
				{ label: 'ai' },
			);

			let safetyNet = 0;
			while (uploadedFile.state === 'PROCESSING' && safetyNet < 15) {
				await new Promise((resolve) => setTimeout(resolve, 2000));
				uploadedFile = await new GoogleGenAI({
					apiKey: this.geminiApiKey,
				}).files.get({ name: uploadedFile.name });
				this.logger.info(`- Current state: ${uploadedFile.state}`, {
					label: 'ai',
				});
				safetyNet++;
			}

			if (uploadedFile.state !== 'ACTIVE') {
				throw new Error(
					`File did not become active. Final state: ${uploadedFile.state}`,
				);
			}

			this.logger.info(`✅ File ${uploadedFile.name} is now ACTIVE!`, {
				label: 'ai',
			});

			tmpobj.removeCallback();

			return createPartFromUri(uploadedFile.uri, uploadedFile.mimeType);
		} catch (err) {
			this.logger.error(`Error processing video/audio: ${err.message || err}`, {
				label: 'media processor',
			});
			return null;
		}
	}

	/**
	 * Process PDF document attachment
	 * @param {import('discord.js').Attachment} attachment - Discord attachment
	 * @returns {Promise<Object|null>} Inline data part or null on error
	 */
	async processDocument(attachment) {
		try {
			const isText =
				attachment.contentType?.startsWith('text/') ||
				attachment.contentType?.startsWith('application/json') ||
				attachment.contentType?.startsWith('application/javascript') ||
				attachment.contentType?.startsWith('application/xml');

			// 1MB limit for text to prevent token exhaustion (1MB text ≈ 250k tokens)
			// 10MB limit for PDFs
			const maxSize = isText ? 1024 * 1024 : 10 * 1024 * 1024;

			if (attachment.size > maxSize) {
				this.logger.warn(
					`📄 Document too large (${Math.round(attachment.size / 1024)}KB), skipping: ${attachment.name}`,
					{ label: 'ai' },
				);
				return null;
			}

			this.logger.info(
				`📄 Document detected: ${attachment.name} (${attachment.contentType})...`,
				{ label: 'ai' },
			);
			const res = await fetch(attachment.url);
			if (!res.ok) {
				throw new Error(`HTTP ${res.status}: ${res.statusText}`);
			}
			const arrayBuffer = await res.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			const base64File = buffer.toString('base64');

			return {
				inlineData: {
					mimeType: attachment.contentType
						? attachment.contentType.split(';')[0].trim()
						: 'application/pdf',
					data: base64File,
				},
			};
		} catch (err) {
			this.logger.error(
				`❌ Error processing document ${attachment.name}: ${err.message || err}`,
				{ label: 'ai' },
			);
			return null;
		}
	}

	/**
	 * Extract YouTube URLs from message content
	 * @param {string} content - Message content
	 * @returns {Array<Object>} Array of YouTube file parts
	 */
	extractYouTubeUrls(content) {
		const mediaParts = [];
		const youtubeRegex =
			/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;

		const matches =
			typeof content === 'string' ? content.matchAll(youtubeRegex) : [];

		for (const match of matches) {
			const videoId = match[1];
			if (videoId) {
				const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
				this.logger.info(
					`▶️ YouTube URL detected and processed: ${youtubeUrl}`,
					{ label: 'ai' },
				);
				mediaParts.push({
					fileData: {
						fileUri: youtubeUrl,
					},
				});
				break; // Only process first YouTube URL
			}
		}

		return mediaParts;
	}
}

module.exports = MediaProcessor;
