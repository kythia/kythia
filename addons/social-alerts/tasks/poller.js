/**
 * @namespace: addons/social-alerts/tasks/poller.js
 * @type: Scheduled Task
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	SectionBuilder,
	ThumbnailBuilder,
	MediaGalleryBuilder,
	MediaGalleryItemBuilder,
} = require('discord.js');

const { fetchLatestVideo } = require('../helpers/youtube');
const { fetchLatestTikTok } = require('../helpers/tiktok');
const { fetchLatestInstagram } = require('../helpers/instagram');

const { BaseTask } = require('kythia-core');

class PollerTask extends BaseTask {
	task = {
		taskName: 'social-alert-poller',
		schedule: '*/5 * * * *',
		active: true,
	};

	async execute(container) {
		const { client, models, helpers, logger, kythiaConfig, t } =
			container || this.container;

		// The poller runs on all shards. We'll filter the subscriptions by the current shard.
		const { ShardClientUtil } = require('discord.js');

		const { SocialAlertSubscription, SocialAlertSetting } = models;
		const { convertColor } = helpers.color;
		const { getGuildSafe } = helpers.discord;

		const rsshubUrl =
			kythiaConfig?.addons?.socialAlerts?.rsshubUrl || 'https://rsshub.app';

		logger.info('📡 Running social alert poller...', {
			label: 'social-alerts',
		});

		let subscriptions;
		try {
			subscriptions = await SocialAlertSubscription.getAllCache();
			if (!subscriptions || subscriptions.length === 0) return;
		} catch (err) {
			logger.error(`Failed to fetch subscriptions: ${err.message || err}`, {
				label: 'social-alerts',
			});
			return;
		}

		const accentColor = convertColor(kythiaConfig?.bot?.color || '#FF0000', {
			from: 'hex',
			to: 'decimal',
		});

		for (const sub of subscriptions) {
			if (client.shard) {
				const expectedShardId = ShardClientUtil.shardIdForGuildId(
					sub.guildId,
					client.shard.count,
				);
				if (!client.shard.ids.includes(expectedShardId)) continue;
			}

			try {
				const platform = sub.platform || 'youtube';

				// Fetch the latest content based on platform
				let latest = null;
				if (platform === 'tiktok') {
					latest = await fetchLatestTikTok(sub.youtubeChannelId, rsshubUrl);
				} else if (platform === 'instagram') {
					latest = await fetchLatestInstagram(sub.youtubeChannelId, rsshubUrl);
				} else {
					latest = await fetchLatestVideo(sub.youtubeChannelId);
				}

				if (!latest) continue;

				// No new content
				if (latest.videoId === sub.lastVideoId) continue;

				// Look up the guild and channel
				const guild = await getGuildSafe(client, sub.guildId);

				// const fakeInteraction = {
				// 	client: client,
				// 	guildId: sub.guildId,
				// 	user: client.user,
				// };

				if (!guild) continue;

				const channel =
					guild.channels.cache.get(sub.discordChannelId) ||
					(await guild.channels.fetch(sub.discordChannelId).catch(() => null));
				if (!channel) continue;

				// Fetch setting for optional role mention
				let setting = null;
				try {
					setting = await SocialAlertSetting.getCache({ guildId: sub.guildId });
				} catch {
					// Proceed without setting
				}

				const mentionText = setting?.mentionRoleId
					? `\nMention: <@&${setting.mentionRoleId}>`
					: '';

				// Resolve the alert message
				const alertMessage = sub.message
					? sub.message
							.replace(/{title}/g, latest.title)
							.replace(/{url}/g, latest.url)
							.replace(/{channel}/g, sub.youtubeChannelName)
					: platform === 'tiktok'
						? await t(guild, 'social-alert.poller.tiktok.default_message', {
								channel: sub.youtubeChannelName,
							})
						: platform === 'instagram'
							? await t(
									guild,
									'social-alert.poller.instagram.default_message',
									{ channel: sub.youtubeChannelName },
								)
							: await t(guild, 'social-alert.poller.youtube.default_message', {
									channel: sub.youtubeChannelName,
								});

				const publishTimestamp = latest.publishedAt
					? `\n-# Published <t:${Math.floor(new Date(latest.publishedAt).getTime() / 1000)}:R>`
					: '';

				// Platform-specific UI values
				const platformLabel =
					platform === 'tiktok'
						? await t(guild, 'social-alert.poller.tiktok.label')
						: platform === 'instagram'
							? await t(guild, 'social-alert.poller.instagram.label')
							: await t(guild, 'social-alert.poller.youtube.label');
				const watchLabel =
					platform === 'tiktok'
						? await t(guild, 'social-alert.poller.tiktok.watch')
						: platform === 'instagram'
							? await t(guild, 'social-alert.poller.instagram.watch')
							: await t(guild, 'social-alert.poller.youtube.watch');
				const channelLabel =
					platform === 'tiktok'
						? `🎵 ${sub.youtubeChannelName}`
						: platform === 'instagram'
							? `📸 ${sub.youtubeChannelName}`
							: `� ${sub.youtubeChannelName}`;
				const channelLink =
					platform === 'tiktok'
						? `https://www.tiktok.com/${sub.youtubeChannelId}`
						: platform === 'instagram'
							? `https://www.instagram.com/${sub.youtubeChannelId.replace(/^@/, '')}/`
							: `https://www.youtube.com/channel/${sub.youtubeChannelId}`;

				// Choose thumbnail:
				// - Prefer stored thumbnail (set when subscription was created from dashboard)
				// - For TikTok/Instagram: fall back to unavatar.io (real profile picture)
				// - For YouTube: fall back to a generic icon
				const _username = (sub.youtubeChannelId || '').replace(/^@/, '');
				const thumbnailUrl =
					sub.youtubeThumbnailUrl ||
					(platform === 'tiktok'
						? `https://unavatar.io/tiktok/${_username}`
						: platform === 'instagram'
							? `https://unavatar.io/instagram/${_username}`
							: null);

				// Build Components V2 alert
				const builder = new ContainerBuilder()
					.setAccentColor(accentColor)
					.addSectionComponents(
						new SectionBuilder()
							.addTextDisplayComponents(
								new TextDisplayBuilder().setContent(
									`## ${platformLabel}\n${alertMessage}\n\n### ${latest.title}${mentionText}${publishTimestamp}`,
								),
							)
							.setThumbnailAccessory(
								thumbnailUrl
									? new ThumbnailBuilder()
											.setURL(thumbnailUrl)
											.setDescription(sub.youtubeChannelName)
									: new ThumbnailBuilder()
											.setURL('https://www.youtube.com/favicon.ico')
											.setDescription('YouTube'),
							),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					);

				// Show video thumbnail in gallery if available
				if (latest.thumbnail) {
					builder
						.addMediaGalleryComponents(
							new MediaGalleryBuilder().addItems([
								new MediaGalleryItemBuilder()
									.setURL(latest.thumbnail)
									.setDescription(`${latest.title} thumbnail`),
							]),
						)
						.addSeparatorComponents(
							new SeparatorBuilder()
								.setSpacing(SeparatorSpacingSize.Small)
								.setDivider(true),
						);
				}

				builder
					.addActionRowComponents(
						new ActionRowBuilder().addComponents(
							new ButtonBuilder()
								.setStyle(ButtonStyle.Link)
								.setLabel(watchLabel.slice(0, 80))
								.setURL(latest.url),
							new ButtonBuilder()
								.setStyle(ButtonStyle.Link)
								.setLabel(channelLabel.slice(0, 80))
								.setURL(channelLink),
						),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							await t(guild, 'common.container.footer', {
								username: client.user.username,
							}),
						),
					);

				const messagePayload = {
					components: [builder],
					flags: MessageFlags.IsComponentsV2,
				};

				// if (mentionText) {
				// 	messagePayload.content = mentionText;
				// }

				await channel.send(messagePayload);

				// Update the last seen content ID
				sub.lastVideoId = latest.videoId;
				await sub.save();

				logger.info(
					`Posted ${platform} alert for "${latest.title}" in guild ${sub.guildId}`,
					{ label: 'social-alerts' },
				);
			} catch (err) {
				logger.error(
					`Error processing subscription ${sub.id} (${sub.youtubeChannelId}): ${err?.message || err}${err?.stack ? `\n${err.stack}` : ''}`,
					{ label: 'social-alerts' },
				);
			}
		}
	}
}

exports.default = PollerTask;
