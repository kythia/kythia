/**
 * @namespace: addons/welcomer/events/guildMemberAdd.js
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

class GuildMemberAddEvent extends BaseEvent {
	async execute(member) {
		const container = this.container;
		const bot = { client: this.client, container: this.container };

		const { models, helpers, kythiaConfig, logger } = container;
		const { WelcomeSetting } = models;
		const { getTextChannelSafe, chunkTextDisplay } = helpers.discord;
		const { convertColor } = helpers.color;

		const guild = member.guild;
		const guildId = guild.id;

		const setting = await WelcomeSetting.getCache({ guildId });
		if (!setting?.welcomeInOn) return;

		const channel = await getTextChannelSafe(guild, setting.welcomeInChannelId);
		if (!channel)
			return logger.info(`Welcome channel not found`, { label: 'welcomer' });

		// ── Welcome Role ──────────────────────────────────────────────
		if (setting.welcomeRoleId) {
			try {
				const welcomeRole = guild.roles.cache.get(setting.welcomeRoleId);
				if (welcomeRole) {
					await member.roles.add(welcomeRole);
					logger.info(`Added welcome role to ${member.user.tag}`, {
						label: 'welcomer',
					});
				}
			} catch (err) {
				logger.error(`Failed to add welcome role: ${err.message || err}`, {
					label: 'welcomer:guildMemberAdd',
				});
			}
		}

		// ── Stats data (shared by text resolution and DM) ─────────────
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

		// ── Welcome Text ──────────────────────────────────────────────
		let welcomeText;
		if (setting.welcomeInEmbedText) {
			const val = setting.welcomeInEmbedText;
			if (typeof val !== 'string' || !val.trim()) {
				welcomeText = `${member.user.username} has joined the server!`;
			} else {
				try {
					welcomeText = await resolvePlaceholders(
						container,
						val,
						statsData,
						member.guild.preferredLocale,
					);
					if (typeof welcomeText === 'string') {
						welcomeText = welcomeText.replace(/\\n/g, '\n');
					}
					if (welcomeText == null) {
						welcomeText = `${member.user.username} has joined the server!`;
					}
				} catch (err) {
					logger.error(
						`Error in resolvePlaceholders for welcomeInText: ${err.message || err}`,
						{ label: 'welcomer:guildMemberAdd' },
					);
					welcomeText = `${member.user.username} has joined the server!`;
				}
			}
		} else {
			welcomeText = `${member.user.username} has joined the server!`;
		}

		const safeWelcomeText =
			typeof welcomeText === 'string' ? welcomeText : String(welcomeText ?? '');

		// ── Components V2 mode ────────────────────────────────────────
		if (setting.isWelcomeInCV2) {
			// ── Banner ────────────────────────────────────────────────
			let welcomeInImage = null;
			try {
				const job = await container.queueManager.dispatch(
					'kythia-welcomer-queue',
					'welcomeBanner',
					{
						userId: member.user.id,
						options: {
							botToken: process.env.DISCORD_BOT_TOKEN,
							customWidth: setting.welcomeInBannerWidth || 1024,
							customHeight: setting.welcomeInBannerHeight || 450,
							customBackground: setting.welcomeInBackgroundUrl || null,
							overlayColor: setting.welcomeInOverlayColor || null,
							avatarSize: setting.welcomeInAvatarSize || null,
							avatarY: setting.welcomeInAvatarYOffset || null,
							avatarBorder: {
								width: setting.welcomeInAvatarBorderWidth || 6,
								color: setting.welcomeInAvatarBorderColor || '#FFFFFF',
							},
							welcomeText:
								(await safeResolvePlaceholder(
									container,
									member,
									setting.welcomeInMainTextContent || 'WELCOME',
									statsData,
									'WELCOME',
								)) || 'WELCOME',
							customUsername:
								(await safeResolvePlaceholder(
									container,
									member,
									setting.welcomeInSubTextContent || '{username}',
									statsData,
									member.user.username,
								)) || member.user.username,
							customFont: setting.welcomeInMainTextFontFamily || null,
							fontWeight: setting.welcomeInMainTextFontWeight || null,
							welcomeColor: setting.welcomeInMainTextColor || null,
							usernameColor: setting.welcomeInSubTextColor || null,
							textOffsetY: setting.welcomeInMainTextYOffset || null,
							textShadow: !!setting.welcomeInShadowColor,
							type: 'welcome',
						},
					},
				);

				const result = await container.queueManager.waitFor(
					job,
					'kythia-welcomer-queue',
				);
				welcomeInImage = Buffer.from(result.data);
			} catch (e) {
				logger.error(`Failed to generate banner: ${e.message}`, {
					label: 'welcomer:guildMemberAdd:banner',
				});
			}

			let embedImageUrl = welcomeInImage;
			const files = [];
			if (Buffer.isBuffer(welcomeInImage)) {
				const { AttachmentBuilder } = require('discord.js');
				const attachment = new AttachmentBuilder(welcomeInImage, {
					name: 'welcome.png',
				});
				files.push(attachment);
				embedImageUrl = 'attachment://welcome.png';
			}

			const accentColor = convertColor(
				setting.welcomeInEmbedColor || kythiaConfig.bot.color,
				{ from: 'hex', to: 'decimal' },
			);

			const welcomeContainer = new ContainerBuilder()
				.setAccentColor(accentColor)
				.addTextDisplayComponents(...chunkTextDisplay(safeWelcomeText));

			if (embedImageUrl) {
				welcomeContainer.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				);
				welcomeContainer.addMediaGalleryComponents(
					new MediaGalleryBuilder().addItems([
						new MediaGalleryItemBuilder().setURL(embedImageUrl),
					]),
				);
			}

			channel
				.send({
					components: [welcomeContainer],
					files,
					flags: MessageFlags.IsComponentsV2,
				})
				.catch((err) =>
					logger.error(`Failed to send welcome msg: ${err.message || err}`, {
						label: 'welcomer:guildMemberAdd:send',
					}),
				);
		} else {
			// ── Plain text mode (no card, no embed) ───────────────────
			channel.send({ content: safeWelcomeText }).catch((err) =>
				logger.error(`Failed to send plain welcome: ${err.message || err}`, {
					label: 'welcomer:guildMemberAdd:send',
				}),
			);
		}

		// ── Welcome DM ────────────────────────────────────────────────
		if (setting.welcomeDmOn && setting.welcomeDmText) {
			try {
				let dmText = setting.welcomeDmText;
				if (typeof dmText === 'string' && dmText.trim()) {
					try {
						dmText = await resolvePlaceholders(
							container,
							dmText,
							statsData,
							member.guild.preferredLocale,
						);
						if (typeof dmText === 'string') {
							dmText = dmText.replace(/\\n/g, '\n');
						}
					} catch (_e) {
						// fallback to raw text if placeholder resolution fails
					}
					await member.send({ content: String(dmText) }).catch(() => {});
				}
			} catch (err) {
				logger.error(
					`[welcomer:guildMemberAdd:send_dm] Error: ${err.message || String(err)}`,
					{ label: 'welcomer:guildMemberAdd:send_dm' },
				);
			}
		}
	}
}

module.exports = GuildMemberAddEvent;
