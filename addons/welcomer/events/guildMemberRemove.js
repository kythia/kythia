/**
 * @namespace: addons/welcomer/events/guildMemberRemove.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	MessageFlags,
	ContainerBuilder,
	SeparatorBuilder,
	MediaGalleryBuilder,
	SeparatorSpacingSize,
	MediaGalleryItemBuilder,
} = require('discord.js');

const {
	resolvePlaceholders,
	safeResolvePlaceholder,
} = require('@coreHelpers/discord');

// kythia-arts is now imported in the sandboxed queue processor

const { BaseEvent } = require('kythia-core');

class GuildMemberRemoveEvent extends BaseEvent {
	async execute(member) {
		const container = this.container;
		const bot = { client: this.client, container: this.container };

		if (!member.guild) return;
		const { models, helpers, kythiaConfig, logger } = container;
		const { WelcomeSetting } = models;
		const { getTextChannelSafe, chunkTextDisplay } = helpers.discord;
		const { convertColor } = helpers.color;

		const setting = await WelcomeSetting.getCache({ guildId: member.guild.id });
		if (!setting?.welcomeOutOn) return;

		const guild = member.guild;

		const outChannel = await getTextChannelSafe(
			guild,
			setting.welcomeOutChannelId,
		);
		if (!outChannel) return;

		// ── Stats data ────────────────────────────────────────────────
		const statsData = {
			userId: member.user.id,
			tag: member.user.tag,
			username: member.user.username,
			userTag: member.user.id,
			guildName: guild.name,
			guildId: guild.id,
			ownerName:
				guild.members.cache.get(guild.ownerId)?.user?.tag ||
				(await guild.fetchOwner().catch(() => null))?.user?.tag ||
				'Unknown',
			ownerId: guild.ownerId,
			region: guild.preferredLocale,
			createdAt: guild.createdAt,
			boosts: guild.premiumSubscriptionCount || 0,
			boostLevel: guild.premiumTier || 0,
			members: guild.memberCount,
			roles: guild.roles.cache.size,
			emojis: guild.emojis.cache.size,
			stickers: guild.stickers.cache.size,
			memberJoin: member.joinedAt,
			online: guild.members.cache.filter((m) => m.presence?.status === 'online')
				.size,
			idle: guild.members.cache.filter((m) => m.presence?.status === 'idle')
				.size,
			dnd: guild.members.cache.filter((m) => m.presence?.status === 'dnd').size,
			offline: guild.members.cache.filter(
				(m) => !m.presence || m.presence.status === 'offline',
			).size,
			bots: guild.members.cache.filter((m) => m.user.bot).size,
			humans: guild.members.cache.filter((m) => !m.user.bot).size,
			onlineBots: guild.members.cache.filter(
				(m) => m.user.bot && m.presence && m.presence.status !== 'offline',
			).size,
			onlineHumans: guild.members.cache.filter(
				(m) => !m.user.bot && m.presence && m.presence.status !== 'offline',
			).size,
			channels: guild.channels.cache.size,
			textChannels: guild.channels.cache.filter(
				(c) => c.type === 0 || c.type === 'GUILD_TEXT',
			).size,
			voiceChannels: guild.channels.cache.filter(
				(c) => c.type === 2 || c.type === 'GUILD_VOICE',
			).size,
			categories: guild.channels.cache.filter(
				(c) => c.type === 4 || c.type === 'GUILD_CATEGORY',
			).size,
			announcementChannels: guild.channels.cache.filter(
				(c) => c.type === 5 || c.type === 'GUILD_ANNOUNCEMENT',
			).size,
			stageChannels: guild.channels.cache.filter(
				(c) => c.type === 13 || c.type === 'GUILD_STAGE_VOICE',
			).size,
			verified: guild.verified,
			partnered: guild.partnered,
			membersTotal: guild.members.cache.size,
		};

		// ── Goodbye Text ──────────────────────────────────────────────
		let goodbyeText;
		if (setting.welcomeOutEmbedText) {
			const val = setting.welcomeOutEmbedText;
			if (typeof val !== 'string' || !val.trim()) {
				goodbyeText = `${member.user.username} has left the server.`;
			} else {
				try {
					goodbyeText = await resolvePlaceholders(
						container,
						val,
						statsData,
						member.guild.preferredLocale,
					);
					if (typeof goodbyeText === 'string') {
						goodbyeText = goodbyeText.replace(/\\n/g, '\n');
					}
				} catch (_e) {
					goodbyeText = `${member.user.username} has left the server.`;
				}
			}
		} else {
			goodbyeText = `${member.user.username} has left the server.`;
		}

		const safeGoodbyeText =
			typeof goodbyeText === 'string' ? goodbyeText : String(goodbyeText ?? '');

		// ── Components V2 mode ────────────────────────────────────────
		if (setting.isWelcomeOutCV2) {
			let goodbyeImage = null;
			try {
				const job = await container.queueManager.dispatch(
					'kythia-welcomer-queue',
					'goodbyeBanner',
					{
						userId: member.user.id,
						options: {
							botToken: kythiaConfig.bot.token,
							customWidth: setting.welcomeOutBannerWidth || 1024,
							customHeight: setting.welcomeOutBannerHeight || 450,
							customBackground: setting.welcomeOutBackgroundUrl || null,
							overlayColor: setting.welcomeOutOverlayColor || null,
							avatarSize: setting.welcomeOutAvatarSize || null,
							avatarY: setting.welcomeOutAvatarYOffset || null,
							avatarBorder: {
								width: setting.welcomeOutAvatarBorderWidth || 6,
								color: setting.welcomeOutAvatarBorderColor || '#FFFFFF',
							},
							welcomeText:
								(await safeResolvePlaceholder(
									container,
									member,
									setting.welcomeOutMainTextContent || 'GOODBYE',
									statsData,
									'GOODBYE',
								)) || 'GOODBYE',
							customUsername:
								(await safeResolvePlaceholder(
									container,
									member,
									setting.welcomeOutSubTextContent || '{username}',
									statsData,
									member.user.username,
								)) || member.user.username,
							customFont: setting.welcomeOutMainTextFontFamily || null,
							fontWeight: setting.welcomeOutMainTextFontWeight || null,
							welcomeColor: setting.welcomeOutMainTextColor || null,
							usernameColor: setting.welcomeOutSubTextColor || null,
							textOffsetY: setting.welcomeOutMainTextYOffset || null,
							type: 'goodbye',
						},
					},
				);

				const result = await container.queueManager.waitFor(
					job,
					'kythia-welcomer-queue',
				);
				goodbyeImage = Buffer.from(result.data);
			} catch (e) {
				logger.error(
					`[Welcomer] Failed to generate goodbye banner: ${e.message}`,
					{
						label: 'welcomer:guildMemberRemove:banner',
					},
				);
			}

			const accentColor = convertColor(
				setting.welcomeOutEmbedColor || kythiaConfig.bot.color,
				{ from: 'hex', to: 'decimal' },
			);

			let embedImageUrl = goodbyeImage;
			const files = [];
			if (Buffer.isBuffer(goodbyeImage)) {
				const { AttachmentBuilder } = require('discord.js');
				const attachment = new AttachmentBuilder(goodbyeImage, {
					name: 'goodbye.png',
				});
				files.push(attachment);
				embedImageUrl = 'attachment://goodbye.png';
			}

			const goodbyeContainer = new ContainerBuilder()
				.setAccentColor(accentColor)
				.addTextDisplayComponents(...chunkTextDisplay(safeGoodbyeText));

			if (embedImageUrl) {
				goodbyeContainer.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				);
				goodbyeContainer.addMediaGalleryComponents(
					new MediaGalleryBuilder().addItems([
						new MediaGalleryItemBuilder().setURL(embedImageUrl),
					]),
				);
			}

			await outChannel
				.send({
					components: [goodbyeContainer],
					files,
					flags: MessageFlags.IsComponentsV2,
				})
				.catch((err) =>
					logger.error(`Failed to send goodbye msg: ${err.message || err}`, {
						label: 'welcomer:guildMemberRemove:send',
					}),
				);
		} else {
			// ── Plain text mode (no card, no embed) ───────────────────
			await outChannel.send({ content: safeGoodbyeText }).catch((err) =>
				logger.error(`Failed to send plain goodbye: ${err.message || err}`, {
					label: 'welcomer:guildMemberRemove:send',
				}),
			);
		}
	}
}

module.exports = GuildMemberRemoveEvent;
