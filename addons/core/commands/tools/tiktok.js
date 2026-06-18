/**
 * @namespace: addons/core/commands/tools/tiktok.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');
const { BaseCommand } = require('kythia-core');
class TiktokCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('tiktok')
		.setDescription('Get and play a TikTok video by link.')
		.addStringOption((option) =>
			option
				.setName('link')
				.setDescription('The TikTok video link')
				.setRequired(true),
		);
	async execute(interaction) {
		const container = this.container;
		const { t, helpers, logger } = container;
		const { simpleContainer } = helpers.discord;
		const tiktokUrl = interaction.options.getString('link');
		const invalidUrlTitle = await t(
			interaction,
			'core.tools.tiktok.error.invalid.url.title',
		);
		const invalidUrlDesc = await t(
			interaction,
			'core.tools.tiktok.error.invalid.url.desc',
		);
		if (
			!/^https?:\/\/(www\.)?tiktok\.com\/.+/.test(tiktokUrl) &&
			!/^https?:\/\/vt\.tiktok\.com\/.+/.test(tiktokUrl)
		) {
			const msg = `${invalidUrlTitle}\n${invalidUrlDesc}`;
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.reply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		await interaction.deferReply();
		try {
			const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(tiktokUrl)}`;
			const response = await fetch(apiUrl);
			const data = await response.json();
			if (!data?.data?.play) {
				throw new Error(data.msg || 'No video found');
			}
			const videoUrl = data.data.play;
			const rawTitle =
				data.data.title ||
				(await t(interaction, 'core.tools.tiktok.default_title'));
			const title =
				rawTitle.length > 256 ? `${rawTitle.substring(0, 253)}...` : rawTitle;
			try {
				await interaction.editReply({
					files: [
						{
							attachment: videoUrl,
							name: 'tiktok.mp4',
							description: title,
						},
					],
				});
			} catch (fileError) {
				const tooLargeTitle = await t(
					interaction,
					'core.tools.tiktok.error.too.large.title',
				);
				const tooLargeDesc = await t(
					interaction,
					'core.tools.tiktok.error.too.large.desc',
					{
						url: videoUrl,
					},
				);
				if (
					fileError.code === 40005 ||
					fileError.message?.includes('Request entity too large')
				) {
					const msg = `${tooLargeTitle}\n${tooLargeDesc}`;
					const components = await simpleContainer(interaction, msg, {
						color: 'Red',
					});
					await interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				} else {
					throw fileError;
				}
			}
		} catch (err) {
			logger.error(`TikTok fetch error: ${err.message || err}`, {
				label: 'tools tiktok',
			});
			let title, desc;
			if (err.message?.includes('No video found')) {
				title = await t(interaction, 'core.tools.tiktok.error.no.video.title');
				desc = await t(interaction, 'core.tools.tiktok.error.no.video.desc');
			} else {
				title = await t(interaction, 'core.tools.tiktok.error.unknown.title');
				desc = await t(interaction, 'core.tools.tiktok.error.unknown.desc');
			}
			const msg = `${title}\n${desc}`;
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}
exports.default = TiktokCommand;
