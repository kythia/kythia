/**
 * @namespace: addons/social-alerts/commands/list.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	SectionBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	ThumbnailBuilder,
	SeparatorSpacingSize,
} = require('discord.js');

const { BaseCommand } = require('kythia-core');

class ListCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('list')
			.setDescription(
				'📋 View all active social alert subscriptions for this server.',
			);

	async execute(interaction) {
		const container = this.container;
		const { models, helpers, kythiaConfig, t } = container;
		const { SocialAlertSubscription, SocialAlertSetting } = models;
		const { simpleContainer, chunkTextDisplay } = helpers.discord;
		const { convertColor } = helpers.color;

		await interaction.deferReply();

		const [subs, setting] = await Promise.all([
			SocialAlertSubscription.getAllCache({ guildId: interaction.guild.id }),
			SocialAlertSetting.getCache({ guildId: interaction.guild.id }),
		]);

		if (!subs || subs.length === 0) {
			return interaction.editReply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'social-alert.list.empty'),
				),
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const accentColor = convertColor(kythiaConfig?.bot?.color || '#FF0000', {
			from: 'hex',
			to: 'decimal',
		});

		const rolePing = setting?.mentionRoleId
			? await t(interaction, 'social-alert.list.role_ping', {
					role: setting.mentionRoleId,
				})
			: '';

		const header = await t(interaction, 'social-alert.list.header', {
			count: subs.length,
			plural: subs.length !== 1 ? 's' : '',
			role_ping: rolePing,
		});

		const builder = new ContainerBuilder()
			.setAccentColor(accentColor)
			.addTextDisplayComponents(...chunkTextDisplay(header))
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			);

		for (const sub of subs) {
			const platform = sub.platform || 'youtube';
			const platformBadge =
				platform === 'tiktok'
					? '🎵 TikTok'
					: platform === 'instagram'
						? '📸 Instagram'
						: '📺 YouTube';
			const fallbackThumb =
				platform === 'tiktok'
					? 'https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/tiktok/webapp/main/webapp-desktop/8152caf0c8e8bc67ae0d.png'
					: platform === 'instagram'
						? 'https://www.instagram.com/favicon.ico'
						: 'https://www.youtube.com/favicon.ico';

			const msgPreview = sub.message
				? await t(interaction, 'social-alert.list.message_preview', {
						message:
							sub.message.length > 80
								? `${sub.message.slice(0, 80)}…`
								: sub.message,
					})
				: '';

			const entryText = await t(interaction, 'social-alert.list.entry', {
				name: sub.youtubeChannelName,
				channel: sub.discordChannelId,
				message_preview: msgPreview,
				platform_badge: platformBadge,
				id: sub.youtubeChannelId,
			});

			builder.addSectionComponents(
				new SectionBuilder()
					.addTextDisplayComponents(...chunkTextDisplay(entryText))
					.setThumbnailAccessory(
						sub.youtubeThumbnailUrl
							? new ThumbnailBuilder()
									.setURL(sub.youtubeThumbnailUrl)
									.setDescription(sub.youtubeChannelName)
							: new ThumbnailBuilder()
									.setURL(fallbackThumb)
									.setDescription(platformBadge),
					),
			);

			builder.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(false),
			);
		}

		const footer = await t(interaction, 'social-alert.list.footer', {
			bot: interaction.client.user.username,
		});

		builder.addTextDisplayComponents(...chunkTextDisplay(footer));

		return interaction.editReply({
			components: [builder],
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = ListCommand;
