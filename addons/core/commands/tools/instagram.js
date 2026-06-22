/**
 * @namespace: addons/core/commands/tools/instagram.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');
const { BaseCommand } = require('kythia-core');
class InstagramCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('instagram')
		.setDescription('Get and play an Instagram post/reel by link.')
		.addStringOption((option) =>
			option
				.setName('link')
				.setDescription('The Instagram post/reel link')
				.setRequired(true),
		);
	async execute(interaction) {
		const container = this.container;
		const { t, helpers, logger } = container;
		const { simpleContainer } = helpers.discord;
		const instaUrl = interaction.options.getString('link');
		const invalidUrlTitle = await t(
			interaction,
			'core.commands.tools.instagram.error.invalid.url.title',
		);
		const invalidUrlDesc = await t(
			interaction,
			'core.commands.tools.instagram.error.invalid.url.desc',
		);
		if (
			!/^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[a-zA-Z0-9_-]+\/?/.test(
				instaUrl,
			) &&
			!/^https?:\/\/instagr\.am\/[a-zA-Z0-9_-]+\/?/.test(instaUrl)
		) {
			const msg = `${invalidUrlTitle}\n${invalidUrlDesc}`;
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
			return;
		}
		await interaction.deferReply();
		try {
			const apiUrl = `https://v3.igdownloader.app/api/ajaxSearch`;
			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'User-Agent':
						'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
				},
				body: `recaptchaToken=&q=${encodeURIComponent(instaUrl)}&t=media&lang=en`,
			});
			const data = await response.json();
			if (data?.status !== 'ok') {
				throw new Error(data.msg || 'No media found');
			}
			const htmlContent = data.data;
			let mediaUrl = null;
			let mediaType = null;
			const videoMatch = htmlContent.match(
				/href="([^"]+)"[^>]*class="[^"]*download-media[^"]*"[^>]*>\s*Download Video/i,
			);
			if (videoMatch) {
				mediaUrl = videoMatch[1];
				mediaType = 'video';
			} else {
				const imageMatch = htmlContent.match(
					/href="([^"]+)"[^>]*class="[^"]*download-media[^"]*"[^>]*>\s*Download Image/i,
				);
				if (imageMatch) {
					mediaUrl = imageMatch[1];
					mediaType = 'image';
				}
			}
			if (!mediaUrl) {
				throw new Error('Could not extract media URL');
			}
			const titleMatch = htmlContent.match(
				/<div[^>]*class="[^"]*desc[^"]*"[^>]*>([^<]+)<\/div>/i,
			);
			const rawTitle =
				titleMatch?.[1]?.trim() ||
				(await t(interaction, 'core.commands.tools.instagram.default_title'));
			const title =
				rawTitle.length > 256 ? `${rawTitle.substring(0, 253)}...` : rawTitle;
			try {
				const fileExtension = mediaType === 'video' ? 'mp4' : 'jpg';
				await interaction.editReply({
					files: [
						{
							attachment: mediaUrl,
							name: `instagram.${fileExtension}`,
							description: title,
						},
					],
				});
			} catch (fileError) {
				const tooLargeTitle = await t(
					interaction,
					'core.commands.tools.instagram.error.too.large.title',
				);
				const tooLargeDesc = await t(
					interaction,
					'core.commands.tools.instagram.error.too.large.desc',
					{
						url: mediaUrl,
					},
				);
				if (
					fileError.code === 40005 ||
					fileError.message?.includes('Request entity too large')
				) {
					const components = await simpleContainer(
						interaction,
						`${tooLargeTitle}\n${tooLargeDesc}`,
						{
							color: 'Red',
						},
					);
					await interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
						files: [],
					});
				} else {
					throw fileError;
				}
			}
		} catch (err) {
			logger.error(`Instagram fetch error: ${err.message || err}`, {
				label: 'core:tools:instagram',
			});
			let title, desc;
			if (err.message?.includes('No media found')) {
				title = await t(
					interaction,
					'core.commands.tools.instagram.error.no.media.title',
				);
				desc = await t(
					interaction,
					'core.commands.tools.instagram.error.no.media.desc',
				);
			} else {
				title = await t(
					interaction,
					'core.commands.tools.instagram.error.unknown.title',
				);
				desc = await t(
					interaction,
					'core.commands.tools.instagram.error.unknown.desc',
				);
			}
			const components = await simpleContainer(
				interaction,
				`${title}\n${desc}`,
				{
					color: 'Red',
				},
			);
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}
exports.default = InstagramCommand;
