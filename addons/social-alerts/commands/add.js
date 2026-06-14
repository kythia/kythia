/**
 * @namespace: addons/social-alerts/commands/add.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ChannelType,
	MessageFlags,
	SectionBuilder,
	SeparatorBuilder,
	ThumbnailBuilder,
	ContainerBuilder,
	TextDisplayBuilder,
	PermissionFlagsBits,
	SeparatorSpacingSize,
} = require('discord.js');

const {
	searchYouTubeChannels,
	fetchLatestVideo,
} = require('../helpers/youtube');
const {
	fetchLatestTikTok,
	getTikTokAccessToken,
	lookupTikTokUser,
} = require('../helpers/tiktok');
const {
	validateInstagramUser,
	fetchLatestInstagram,
} = require('../helpers/instagram');

const { BaseCommand } = require('kythia-core');

const TIKTOK_LOGO_URL =
	'https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/tiktok/webapp/main/webapp-desktop/8152caf0c8e8bc67ae0d.png';

const MAX_SUBSCRIPTIONS_PER_GUILD = 25;

class AddCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('add')
			.setDescription(
				'➕ Subscribe to a social media creator and get notified on new posts.',
			)
			.addStringOption((option) =>
				option
					.setName('platform')
					.setDescription('📱 The platform to track.')
					.setRequired(true)
					.addChoices(
						{ name: '📺 YouTube', value: 'youtube' },
						{ name: '🎵 TikTok', value: 'tiktok' },
						{ name: '📸 Instagram', value: 'instagram' },
					),
			)
			.addStringOption((option) =>
				option
					.setName('channel')
					.setDescription(
						'🔍 YouTube: search by name. TikTok: enter @username.',
					)
					.setAutocomplete(true)
					.setRequired(true),
			)
			.addChannelOption((option) =>
				option
					.setName('discord_channel')
					.setDescription('📢 Discord channel where alerts will be posted.')
					.addChannelTypes(ChannelType.GuildText)
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('message')
					.setDescription(
						'✉️ Custom alert message. Variables: {title}, {url}, {channel}',
					),
			);

	async autocomplete(interaction) {
		const container = this.container;
		const { kythiaConfig, logger } = container;

		const platform = interaction.options.getString('platform');
		const focused = interaction.options.getFocused();

		// ── TikTok autocomplete ─────────────────────────────────────────────────
		if (platform === 'tiktok') {
			const clientKey =
				kythiaConfig?.addons?.socialAlerts?.tiktokClientKey ||
				process.env.TIKTOK_CLIENT_KEY;
			const clientSecret =
				kythiaConfig?.addons?.socialAlerts?.tiktokClientSecret ||
				process.env.TIKTOK_CLIENT_SECRET;

			// Show prompt when nothing is typed yet
			if (!focused || focused.trim().length < 2) {
				return interaction.respond([
					{
						name: '🔍 Start typing a TikTok @username…',
						value: '_placeholder',
					},
				]);
			}

			const cleanInput = focused.replace(/^@/, '').trim();
			const hintUsername = `@${cleanInput}`;

			try {
				// ── Tier 1: Research API (if credentials available + approved) ──
				if (clientKey && clientSecret) {
					const accessToken = await getTikTokAccessToken(
						clientKey,
						clientSecret,
					);
					if (accessToken) {
						const user = await lookupTikTokUser(cleanInput, accessToken);
						if (user) {
							const followerStr =
								user.followerCount >= 1_000_000
									? `${(user.followerCount / 1_000_000).toFixed(1)}M followers`
									: user.followerCount >= 1_000
										? `${(user.followerCount / 1_000).toFixed(1)}K followers`
										: `${user.followerCount} followers`;
							const finalName = `🎵 ${user.displayName} (${user.username}) · ${followerStr}`;
							return interaction.respond([
								{
									name:
										finalName.length > 100
											? finalName.slice(0, 100)
											: finalName,
									value: user.username.slice(0, 100),
								},
							]);
						}
						// Research API returned nothing — could be unapproved or not found
						// Fall through to oEmbed
					}
				}

				// ── Tier 2: oEmbed (public, no auth needed) ─────────────────────
				const oEmbedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(`https://www.tiktok.com/@${cleanInput}`)}`;
				const oEmbedRes = await fetch(oEmbedUrl, {
					headers: { 'User-Agent': 'KythiaBot/1.0' },
					signal: AbortSignal.timeout(5_000),
				});

				if (oEmbedRes.ok) {
					const oembed = await oEmbedRes.json();
					const displayName = oembed.author_name || hintUsername;
					const finalName = `🎵 ${displayName} (${hintUsername})`;
					return interaction.respond([
						{
							name:
								finalName.length > 100 ? finalName.slice(0, 100) : finalName,
							value: hintUsername.slice(0, 100),
						},
					]);
				}

				// oEmbed returned non-OK (404 = user doesn't exist)
				if (oEmbedRes.status === 404) {
					return interaction.respond([
						{
							name: `❌ ${hintUsername} — TikTok account not found`,
							value: '_not_found',
						},
					]);
				}

				// ── Tier 3: Echo input (oEmbed unavailable, let user proceed) ───
				return interaction.respond([
					{ name: `🎵 ${hintUsername}`, value: hintUsername },
				]);
			} catch (err) {
				logger.warn(`TikTok autocomplete error: ${err.message || err}`, {
					label: 'social-alerts',
				});
				// Don't block the user — echo their input
				return interaction.respond([
					{ name: `🎵 ${hintUsername}`, value: hintUsername },
				]);
			}
		}

		// ── Instagram autocomplete (username via RSSHub validation) ──────────────────
		if (platform === 'instagram') {
			if (!focused || focused.trim().length < 2) {
				return interaction.respond([
					{
						name: '🔍 Start typing an Instagram @username…',
						value: '_placeholder',
					},
				]);
			}

			const rsshubUrl =
				kythiaConfig?.addons?.socialAlerts?.rsshubUrl || 'https://rsshub.app';
			const cleanInput = focused.replace(/^@/, '').trim();
			const hintUsername = `@${cleanInput}`;

			try {
				const userInfo = await validateInstagramUser(cleanInput, rsshubUrl);
				if (userInfo) {
					const finalName = `📸 ${userInfo.displayName} (${hintUsername})`;
					return interaction.respond([
						{
							name:
								finalName.length > 100 ? finalName.slice(0, 100) : finalName,
							value: hintUsername.slice(0, 100),
						},
					]);
				}
				// Not found via RSSHub — echo with a not-found label
				return interaction.respond([
					{
						name: `❌ ${hintUsername} — Instagram account not found`,
						value: '_not_found',
					},
				]);
			} catch (err) {
				logger.warn(`Instagram autocomplete error: ${err.message || err}`, {
					label: 'social-alerts',
				});
				return interaction.respond([
					{ name: `📸 ${hintUsername}`, value: hintUsername },
				]);
			}
		}

		// ── YouTube autocomplete via YouTube Data API v3 ───────────────────────
		// YouTube: search via YouTube Data API v3
		const apiKey =
			kythiaConfig?.addons?.socialAlerts?.youtubeApiKey ||
			process.env.YOUTUBE_API_KEY;

		if (!apiKey) {
			return interaction.respond([
				{ name: '⚠️ YouTube API key not configured', value: 'no_key' },
			]);
		}

		if (!focused || focused.trim().length < 2) {
			return interaction.respond([]);
		}

		try {
			const results = await searchYouTubeChannels(focused, apiKey);
			await interaction.respond(
				results.map((ch) => ({
					name: ch.name.length > 100 ? ch.name.slice(0, 100) : ch.name,
					value: ch.id.length > 100 ? ch.id.slice(0, 100) : ch.id,
				})),
			);
		} catch (err) {
			logger.warn(`Autocomplete error: ${err.message || err}`, {
				label: 'social-alerts',
			});
			await interaction.respond([]);
		}
	}

	async execute(interaction) {
		const container = this.container;
		const { models, helpers, logger, kythiaConfig, t } = container;
		const { SocialAlertSubscription } = models;
		const { simpleContainer } = helpers.discord;
		const { convertColor } = helpers.color;

		if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
			return interaction.reply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'social-alert.error.no_permission'),
					{ color: 'Red' },
				),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}

		await interaction.deferReply();

		const platform = interaction.options.getString('platform', true);
		const channelInput = interaction.options.getString('channel', true);
		const discordChannel = interaction.options.getChannel(
			'discord_channel',
			true,
		);
		const customMessage = interaction.options.getString('message');

		// Guard against empty username for TikTok/Instagram
		if (
			(platform === 'tiktok' || platform === 'instagram') &&
			!channelInput.trim()
		) {
			const key =
				platform === 'instagram'
					? 'social-alert.add.instagram.no_username'
					: 'social-alert.add.tiktok.no_username';
			return interaction.editReply({
				components: await simpleContainer(
					interaction,
					await t(interaction, key),
					{ color: 'Red' },
				),
				flags: MessageFlags.IsComponentsV2,
			});
		}

		// Guard against "no_key" sentinel value from autocomplete
		if (channelInput === 'no_key') {
			return interaction.editReply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'social-alert.error.no_key'),
					{ color: 'Red' },
				),
				flags: MessageFlags.IsComponentsV2,
			});
		}

		try {
			const existing = await SocialAlertSubscription.getAllCache({
				guildId: interaction.guild.id,
			});

			if (existing.length >= MAX_SUBSCRIPTIONS_PER_GUILD) {
				return interaction.editReply({
					components: await simpleContainer(
						interaction,
						await t(interaction, 'social-alert.error.limit', {
							limit: MAX_SUBSCRIPTIONS_PER_GUILD,
						}),
						{ color: 'Red' },
					),
					flags: MessageFlags.IsComponentsV2,
				});
			}

			// ── Platform-specific handling ──────────────────────────────────────
			if (platform === 'youtube') {
				return await handleYouTubeAdd({
					interaction,
					existing,
					youtubeChannelId: channelInput,
					discordChannel,
					customMessage,
					SocialAlertSubscription,
					simpleContainer,
					convertColor,
					kythiaConfig,
					t,
				});
			}

			if (platform === 'tiktok') {
				return await handleTikTokAdd({
					interaction,
					existing,
					rawUsername: channelInput,
					discordChannel,
					customMessage,
					SocialAlertSubscription,
					simpleContainer,
					convertColor,
					kythiaConfig,
					t,
				});
			}

			if (platform === 'instagram') {
				return await handleInstagramAdd({
					interaction,
					existing,
					rawUsername: channelInput,
					discordChannel,
					customMessage,
					SocialAlertSubscription,
					simpleContainer,
					convertColor,
					kythiaConfig,
					t,
				});
			}
		} catch (err) {
			logger.error(`Error in add command: ${err.message || err}`, {
				label: 'social-alerts',
			});
			return interaction.editReply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'social-alert.error.failed', {
						error: err.message,
					}),
					{ color: 'Red' },
				),
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}

exports.default = AddCommand;

// ── YouTube handler ─────────────────────────────────────────────────────────────
async function handleYouTubeAdd({
	interaction,
	existing,
	youtubeChannelId,
	discordChannel,
	customMessage,
	SocialAlertSubscription,
	simpleContainer,
	convertColor,
	kythiaConfig,
	t,
}) {
	// Duplicate check
	const duplicate = existing.find(
		(s) => s.platform === 'youtube' && s.youtubeChannelId === youtubeChannelId,
	);
	if (duplicate) {
		return interaction.editReply({
			components: await simpleContainer(
				interaction,
				await t(interaction, 'social-alert.add.duplicate.youtube', {
					name: duplicate.youtubeChannelName,
				}),
				{ color: 'Yellow' },
			),
			flags: MessageFlags.IsComponentsV2,
		});
	}

	// Fetch channel info (name + thumbnail)
	const apiKey =
		kythiaConfig?.addons?.socialAlerts?.youtubeApiKey ||
		process.env.YOUTUBE_API_KEY;

	let channelName = youtubeChannelId;
	let thumbnailUrl = null;

	if (apiKey) {
		try {
			const url = new URL('https://www.googleapis.com/youtube/v3/channels');
			url.searchParams.set('part', 'snippet');
			url.searchParams.set('id', youtubeChannelId);
			url.searchParams.set('key', apiKey);
			const res = await fetch(url.href);
			if (res.ok) {
				const data = await res.json();
				const ch = data.items?.[0];
				if (ch) {
					channelName = ch.snippet.title;
					thumbnailUrl =
						ch.snippet.thumbnails?.high?.url ||
						ch.snippet.thumbnails?.default?.url ||
						null;
				}
			}
		} catch {
			// Non-critical
		}
	}

	// Seed lastVideoId to avoid spam on first run
	let lastVideoId = null;
	try {
		const latest = await fetchLatestVideo(youtubeChannelId);
		if (latest) lastVideoId = latest.videoId;
	} catch {
		// Non-critical
	}

	await SocialAlertSubscription.create({
		guildId: interaction.guild.id,
		discordChannelId: discordChannel.id,
		youtubeChannelId,
		youtubeChannelName: channelName,
		youtubeThumbnailUrl: thumbnailUrl,
		message: customMessage || null,
		lastVideoId,
		platform: 'youtube',
	});

	const messageLine = customMessage
		? await t(interaction, 'social-alert.add.success.custom_message', {
				message: customMessage,
			})
		: await t(interaction, 'social-alert.add.success.default_message');
	const description = await t(interaction, 'social-alert.add.success.youtube', {
		name: channelName,
		channel: discordChannel.id,
		message_line: messageLine,
	});
	const footer = await t(interaction, 'social-alert.add.success.footer');

	return interaction.editReply({
		components: [
			buildSuccessContainer({
				accentColor: convertColor(kythiaConfig?.bot?.color || '#FF0000', {
					from: 'hex',
					to: 'decimal',
				}),
				description,
				footer,
				thumbnailUrl,
				thumbnailAlt: channelName,
			}),
		],
		flags: MessageFlags.IsComponentsV2,
	});
}

// ── TikTok handler ──────────────────────────────────────────────────────────────
async function handleTikTokAdd({
	interaction,
	existing,
	rawUsername,
	discordChannel,
	customMessage,
	SocialAlertSubscription,
	simpleContainer,
	convertColor,
	kythiaConfig,
	t,
}) {
	const rsshubUrl =
		kythiaConfig?.addons?.socialAlerts?.rsshubUrl || 'https://rsshub.app';
	const username = rawUsername.startsWith('@')
		? rawUsername
		: `@${rawUsername}`;

	// Duplicate check
	const duplicate = existing.find(
		(s) =>
			s.platform === 'tiktok' &&
			s.youtubeChannelId.toLowerCase() === username.toLowerCase(),
	);
	if (duplicate) {
		return interaction.editReply({
			components: await simpleContainer(
				interaction,
				await t(interaction, 'social-alert.add.duplicate.tiktok', {
					name: duplicate.youtubeChannelName,
				}),
				{ color: 'Yellow' },
			),
			flags: MessageFlags.IsComponentsV2,
		});
	}

	// Validate + resolve TikTok user info
	// Tier 1: oEmbed (public, no auth, fast)
	const cleanUsername = rawUsername.replace(/^@/, '').trim();
	let displayName = username;

	try {
		const oEmbedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(`https://www.tiktok.com/@${cleanUsername}`)}`;
		const oEmbedRes = await fetch(oEmbedUrl, {
			headers: { 'User-Agent': 'KythiaBot/1.0' },
			signal: AbortSignal.timeout(6_000),
		});

		if (oEmbedRes.status === 404) {
			// oEmbed explicitly says the user doesn't exist
			return interaction.editReply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'social-alert.add.tiktok.not_found', {
						username,
					}),
					{ color: 'Red' },
				),
				flags: MessageFlags.IsComponentsV2,
			});
		}

		if (oEmbedRes.ok) {
			const oembed = await oEmbedRes.json();
			displayName = oembed.author_name || username;
		}
		// Any other status (rate limit, server error) → proceed with input as-is
	} catch {
		// Network error → proceed with input as-is (non-critical)
	}

	// Seed lastVideoId via RSSHub (non-critical, best-effort)
	let lastVideoId = null;
	try {
		const latest = await fetchLatestTikTok(rawUsername, rsshubUrl);
		if (latest) lastVideoId = latest.videoId;
	} catch {
		// Non-critical
	}

	await SocialAlertSubscription.create({
		guildId: interaction.guild.id,
		discordChannelId: discordChannel.id,
		youtubeChannelId: username,
		youtubeChannelName: displayName,
		youtubeThumbnailUrl: null,
		message: customMessage || null,
		lastVideoId,
		platform: 'tiktok',
	});

	const messageLine = customMessage
		? await t(interaction, 'social-alert.add.success.custom_message', {
				message: customMessage,
			})
		: await t(interaction, 'social-alert.add.success.default_message');
	const description = await t(interaction, 'social-alert.add.success.tiktok', {
		name: displayName,
		username,
		channel: discordChannel.id,
		message_line: messageLine,
	});
	const footer = await t(interaction, 'social-alert.add.success.footer');

	return interaction.editReply({
		components: [
			buildSuccessContainer({
				accentColor: convertColor(kythiaConfig?.bot?.color || '#FF0000', {
					from: 'hex',
					to: 'decimal',
				}),
				description,
				footer,
				thumbnailUrl: TIKTOK_LOGO_URL,
				thumbnailAlt: 'TikTok',
			}),
		],
		flags: MessageFlags.IsComponentsV2,
	});
}

// ── Shared Components V2 success builder ────────────────────────────────────────
function buildSuccessContainer({
	accentColor,
	description,
	footer,
	thumbnailUrl,
	thumbnailAlt,
}) {
	return new ContainerBuilder()
		.setAccentColor(accentColor)
		.addSectionComponents(
			new SectionBuilder()
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(description),
				)
				.setThumbnailAccessory(
					new ThumbnailBuilder()
						.setURL(thumbnailUrl || 'https://www.youtube.com/favicon.ico')
						.setDescription(thumbnailAlt || 'Alert'),
				),
		)
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		)
		.addTextDisplayComponents(new TextDisplayBuilder().setContent(footer));
}

// ── Instagram handler ────────────────────────────────────────────────────────────
async function handleInstagramAdd({
	interaction,
	existing,
	rawUsername,
	discordChannel,
	customMessage,
	SocialAlertSubscription,
	simpleContainer,
	convertColor,
	kythiaConfig,
	t,
}) {
	const rsshubUrl =
		kythiaConfig?.addons?.socialAlerts?.rsshubUrl || 'https://rsshub.app';
	const username = rawUsername.startsWith('@')
		? rawUsername
		: `@${rawUsername}`;
	const cleanUsername = rawUsername.replace(/^@/, '').trim();

	// Duplicate check
	const duplicate = existing.find(
		(s) =>
			s.platform === 'instagram' &&
			s.youtubeChannelId.toLowerCase() === username.toLowerCase(),
	);
	if (duplicate) {
		return interaction.editReply({
			components: await simpleContainer(
				interaction,
				await t(interaction, 'social-alert.add.duplicate.instagram', {
					name: duplicate.youtubeChannelName,
				}),
				{ color: 'Yellow' },
			),
			flags: MessageFlags.IsComponentsV2,
		});
	}

	// Validate via RSSHub
	const userInfo = await validateInstagramUser(cleanUsername, rsshubUrl);
	if (!userInfo) {
		return interaction.editReply({
			components: await simpleContainer(
				interaction,
				await t(interaction, 'social-alert.add.instagram.not_found', {
					username,
				}),
				{ color: 'Red' },
			),
			flags: MessageFlags.IsComponentsV2,
		});
	}

	// Seed lastVideoId (non-critical, best-effort)
	let lastVideoId = null;
	try {
		const latest = await fetchLatestInstagram(cleanUsername, rsshubUrl);
		if (latest) lastVideoId = latest.videoId;
	} catch {
		// Non-critical
	}

	await SocialAlertSubscription.create({
		guildId: interaction.guild.id,
		discordChannelId: discordChannel.id,
		youtubeChannelId: username,
		youtubeChannelName: userInfo.displayName,
		youtubeThumbnailUrl: null,
		message: customMessage || null,
		lastVideoId,
		platform: 'instagram',
	});

	const messageLine = customMessage
		? await t(interaction, 'social-alert.add.success.custom_message', {
				message: customMessage,
			})
		: await t(interaction, 'social-alert.add.success.default_message');
	const description = await t(
		interaction,
		'social-alert.add.success.instagram',
		{
			name: userInfo.displayName,
			username,
			channel: discordChannel.id,
			message_line: messageLine,
		},
	);
	const footer = await t(interaction, 'social-alert.add.success.footer');

	return interaction.editReply({
		components: [
			buildSuccessContainer({
				accentColor: convertColor(kythiaConfig?.bot?.color || '#FF0000', {
					from: 'hex',
					to: 'decimal',
				}),
				description,
				footer,
				thumbnailUrl: null,
				thumbnailAlt: 'Instagram',
			}),
		],
		flags: MessageFlags.IsComponentsV2,
	});
}
