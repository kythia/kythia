/**
 * @namespace: addons/booster/events/guildMemberUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	resolvePlaceholders,
	safeResolvePlaceholder,
} = require('@coreHelpers/discord');

// kythia-arts is now imported in the sandboxed queue processor
const {
	ContainerBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	MediaGalleryBuilder,
	MediaGalleryItemBuilder,
	MessageFlags,
} = require('discord.js');

const { BaseEvent } = require('kythia-core');

class GuildMemberUpdateEvent extends BaseEvent {
	async execute(oldMember, newMember) {
		const container = this.container;
		const _bot = { client: this.client, container: this.container };

		if (
			oldMember.premiumSinceTimestamp !== null ||
			!newMember.premiumSinceTimestamp
		)
			return;

		const { models, helpers, logger } = container;
		const { BoosterSetting } = models;
		const { embedFooter, getTextChannelSafe, chunkTextDisplay } =
			helpers.discord;
		const { convertColor } = helpers.color;

		const guild = newMember.guild;
		const guildId = guild.id;

		const setting = await BoosterSetting.getCache({ guildId });
		if (!setting?.boosterOn) return;

		const channel = await getTextChannelSafe(guild, setting.boosterChannelId);
		if (!channel)
			return logger.info(`Booster channel not found`, { label: 'booster' });

		// ── Stats data ─────────────
		const statsData = {
			userId: newMember.user.id,
			tag: newMember.user.tag,
			username: newMember.user.username,
			userTag: newMember.user.id,
			guildName: guild.name,
			guildId: guild.id,
			ownerName: guild.members.cache.get(guild.ownerId)?.user?.tag || 'Unknown',
			ownerId: guild.ownerId,
			region: guild.preferredLocale,
			createdAt: guild.createdAt,
			boosts: guild.premiumSubscriptionCount || 0,
			boostLevel: guild.premiumTier || 0,
			members: guild.memberCount,
			roles: guild.roles.cache.size,
			emojis: guild.emojis.cache.size,
			stickers: guild.stickers.cache.size,
			memberJoin: newMember.joinedAt,
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

		// ── Booster Text ──────────────────────────────────────────────
		let boosterText;
		if (setting.boosterEmbedText) {
			const val = setting.boosterEmbedText;
			if (typeof val !== 'string' || !val.trim()) {
				boosterText = `${newMember.user.username} just boosted the server!`;
			} else {
				try {
					boosterText = await resolvePlaceholders(
						container,
						val,
						statsData,
						newMember.guild.preferredLocale,
					);
					if (typeof boosterText === 'string') {
						boosterText = boosterText.replace(/\\n/g, '\n');
					}
					if (boosterText == null) {
						boosterText = `${newMember.user.username} just boosted the server!`;
					}
				} catch (err) {
					logger.error(
						`Error in resolvePlaceholders for boosterText: ${err.message || err}`,
						{ label: 'booster:guildMemberUpdate' },
					);
					boosterText = `${newMember.user.username} just boosted the server!`;
				}
			}
		} else {
			boosterText = `${newMember.user.username} just boosted the server!`;
		}

		const safeBoosterText =
			typeof boosterText === 'string' ? boosterText : String(boosterText ?? '');

		// ── Components V2 mode ────────────────────────────────────────
		if (setting.isBoosterCV2) {
			// ── Banner ────────────────────────────────────────────────
			let boosterImage = null;
			try {
				const job = await container.queueManager.dispatch(
					'kythia-booster-queue',
					'boosterBanner',
					{
						userId: newMember.user.id,
						options: {
							botToken: process.env.DISCORD_BOT_TOKEN,
							customWidth: setting.boosterBannerWidth || 1024,
							customHeight: setting.boosterBannerHeight || 450,
							customBackground: setting.boosterBackgroundUrl || null,
							overlayColor: setting.boosterOverlayColor || null,
							avatarSize: setting.boosterAvatarSize || null,
							avatarY: setting.boosterAvatarYOffset || null,
							avatarBorder: {
								width: setting.boosterAvatarBorderWidth || 6,
								color: setting.boosterAvatarBorderColor || '#FF73FA',
							},
							welcomeText:
								(await safeResolvePlaceholder(
									container,
									newMember,
									setting.boosterMainTextContent || 'SERVER BOOSTER',
									statsData,
									'SERVER BOOSTER',
								)) || 'SERVER BOOSTER',
							customUsername:
								(await safeResolvePlaceholder(
									container,
									newMember,
									setting.boosterSubTextContent || '{username}',
									statsData,
									newMember.user.username,
								)) || newMember.user.username,
							customFont: setting.boosterMainTextFontFamily || null,
							fontWeight: setting.boosterMainTextFontWeight || null,
							welcomeColor: setting.boosterMainTextColor || '#FF73FA',
							usernameColor: setting.boosterSubTextColor || null,
							textOffsetY: setting.boosterMainTextYOffset || null,
							textShadow: !!setting.boosterShadowColor,
							type: 'welcome',
						},
					},
				);

				const result = await container.queueManager.waitFor(
					job,
					'kythia-booster-queue',
				);
				boosterImage = Buffer.from(result.data);
			} catch (e) {
				logger.error(`Failed to generate banner: ${e.message}`, {
					label: 'booster:guildMemberUpdate:banner',
				});
			}

			let embedImageUrl = boosterImage;
			const files = [];
			if (Buffer.isBuffer(boosterImage)) {
				const { AttachmentBuilder } = require('discord.js');
				const attachment = new AttachmentBuilder(boosterImage, {
					name: 'boost.png',
				});
				files.push(attachment);
				embedImageUrl = 'attachment://boost.png';
			}

			const footerObj = await embedFooter(newMember);
			const footerContent = footerObj?.text || '';

			const accentColor = convertColor(setting.boosterEmbedColor || '#FF73FA', {
				from: 'hex',
				to: 'decimal',
			});

			const boosterContainer = new ContainerBuilder()
				.setAccentColor(accentColor)
				.addTextDisplayComponents(...chunkTextDisplay(safeBoosterText))
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				);

			if (embedImageUrl) {
				boosterContainer.addMediaGalleryComponents(
					new MediaGalleryBuilder().addItems([
						new MediaGalleryItemBuilder().setURL(embedImageUrl),
					]),
				);
				boosterContainer.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				);
			}

			boosterContainer.addTextDisplayComponents(
				...chunkTextDisplay(footerContent),
			);

			channel
				.send({
					components: [boosterContainer],
					files,
					flags: MessageFlags.IsComponentsV2,
				})
				.catch((err) =>
					logger.error(`Failed to send booster msg: ${err.message || err}`, {
						label: 'booster:guildMemberUpdate:send',
					}),
				);
		} else {
			// ── Plain text mode (no card, no embed) ───────────────────
			channel.send({ content: safeBoosterText }).catch((err) =>
				logger.error(`Failed to send plain booster: ${err.message || err}`, {
					label: 'booster:guildMemberUpdate:send',
				}),
			);
		}
	}
}

module.exports = GuildMemberUpdateEvent;
