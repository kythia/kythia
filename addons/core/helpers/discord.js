/**
 * @namespace: addons/core/helpers/discord.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	MediaGalleryBuilder,
	SeparatorSpacingSize,
	MediaGalleryItemBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	MessageFlags,
} = require('discord.js');

const TIER_LEVELS = {
	none: 0,
	cute: 1,
	powerful: 2,
	yours: 3,
	ecosystem: 4,
};

const axios = require('axios');

/**
 * Builds a consistent embed footer with bot username and avatar based on the context.
 * Works for `Interaction`, `Message`, and `GuildMember` sources.
 * @param {object} source - Discord.js object carrying a `client` and possibly `guild`.
 * @returns {Promise<{text:string, iconURL?:string}>}
 */
const embedFooter = async (source) => {
	const { logger, t } = source.client.container;

	const client = source.client;

	if (!client) {
		logger.warn(`Cant find client in embedFooter`, { label: 'discord-helper' });
		return { text: 'Kythia' };
	}

	const botUser = client.user;

	const translationContext = source.guild || source;

	return {
		text: await t(translationContext, 'common.embed.footer', {
			username: botUser?.username,
		}),
		iconURL: botUser?.displayAvatarURL({ dynamic: true }),
	};
};

/**
 * Sets a custom status message on a voice channel via Discord HTTP API.
 * @param {import('discord.js').VoiceChannel|import('discord.js').BaseVoiceChannel} channel - Voice-capable channel.
 * @param {string} status - Status text to display.
 */
async function setVoiceChannelStatus(channel, status) {
	if (!channel?.isVoiceBased()) {
		return;
	}
	const config = channel.client.container.kythiaConfig;
	const botToken = config.bot.token;

	try {
		await axios.put(
			`https://discord.com/api/v10/channels/${channel.id}/voice-status`,
			{ status: status },
			{ headers: { Authorization: `Bot ${botToken}` } },
		);
	} catch (_e) {}
}

/**
 * Chunks a long string into multiple TextDisplayBuilder components safely,
 * and prevents markdown code blocks (```) from breaking.
 * @param {string} content - Main response text
 * @param {number} [limit=4000] - Limit of characters per text display
 * @returns {Array<import('discord.js').TextDisplayBuilder>}
 */
function chunkTextDisplay(content, limit = 3999) {
	if (!content) return [new TextDisplayBuilder().setContent('')];

	const chunks = [];
	let str = content;
	let isInsideCodeBlock = false;
	let currentLang = '';

	while (str.length > limit) {
		// Sisakan sedikit space buat nambahin tag penutup ``` (3 karakter)
		const safeLimit = isInsideCodeBlock ? limit - 4 : limit;
		let breakIndex = safeLimit;

		const lastNewline = str.lastIndexOf('\n', safeLimit);
		if (lastNewline > safeLimit - 500 && lastNewline > 0) {
			breakIndex = lastNewline;
		} else {
			const lastSpace = str.lastIndexOf(' ', safeLimit);
			if (lastSpace > safeLimit - 100 && lastSpace > 0) {
				breakIndex = lastSpace;
			}
		}

		let chunkText = str.substring(0, breakIndex);

		// Cek apakah di dalam chunk ini ada pembuka/penutup code block
		const codeBlocksCount = (chunkText.match(/```/g) || []).length;
		if (codeBlocksCount % 2 !== 0) {
			isInsideCodeBlock = !isInsideCodeBlock;

			// Ambil bahasa pemrogramannya (misal: ```js) kalau baru dibuka
			if (isInsideCodeBlock) {
				const lastTickIndex = chunkText.lastIndexOf('```');
				const nextNewline = chunkText.indexOf('\n', lastTickIndex);
				currentLang =
					nextNewline !== -1
						? chunkText.substring(lastTickIndex + 3, nextNewline).trim()
						: '';
			}
		}

		// Kalau terpotong pas di tengah code block, tutup paksa di chunk ini
		if (isInsideCodeBlock) {
			chunkText += '\n```';
		}

		chunks.push(new TextDisplayBuilder().setContent(chunkText));

		// Lanjut ke sisa string
		str = str.substring(breakIndex).trimStart();

		// Kalau tadi terpotong di tengah code block, buka lagi di awal chunk berikutnya
		if (isInsideCodeBlock) {
			str = `\`\`\`${currentLang}\n${str}`;
		}
	}

	if (str.length > 0) {
		chunks.push(new TextDisplayBuilder().setContent(str));
	}

	return chunks;
}
/**
 * Create a simple Discord container reply with optional color & auto-footer.
 * @param {object} interaction - Discord interaction (for t)
 * @param {object} container - Dependency injection
 * @param {string} content - Main response text
 * @param {object} [options={}] - Extra options
 * @param {string} [options.color] - Accent color (hex/discord)
 * @returns {Promise<object>} - Discord reply obj ({ components, flags })
 */
async function simpleContainer(interaction, content, options = {}) {
	const { kythiaConfig, helpers, t, logger } = interaction.client.container;
	const { convertColor } = helpers.color;
	const { color, withFooter = false } = options;

	const defaultAccent = convertColor(kythiaConfig.bot.color, {
		from: 'hex',
		to: 'decimal',
	});

	let accentColor = defaultAccent;

	if (color) {
		const isHex = /^#?([0-9A-Fa-f]{6})$/.test(color);

		if (isHex) {
			accentColor = convertColor(color, { from: 'hex', to: 'decimal' });
		} else {
			try {
				accentColor = convertColor(color, { from: 'discord', to: 'decimal' });
			} catch (err) {
				accentColor = defaultAccent;
				logger.error(`Error: ${err.message || err}`, {
					label: 'core',
				});
			}
		}
	}

	const replyContainer = new ContainerBuilder()
		.setAccentColor(accentColor)
		.addTextDisplayComponents(...chunkTextDisplay(content));

	if (withFooter) {
		replyContainer
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(interaction, 'common.container.footer', {
						username: interaction.client.user.username,
					}),
				),
			);
	}

	return [replyContainer];
}

async function createContainer(interaction, options = {}) {
	const { kythiaConfig, helpers, t, logger } = interaction.client.container;
	const { convertColor } = helpers.color;

	const {
		color,
		title,
		description,
		media,
		components,
		footer = false,
	} = options;

	const defaultAccent = convertColor(kythiaConfig.bot.color, {
		from: 'hex',
		to: 'decimal',
	});

	let accentColor = defaultAccent;

	if (color) {
		const isHex = /^#?([0-9A-Fa-f]{6})$/.test(color);

		if (isHex) {
			accentColor = convertColor(color, { from: 'hex', to: 'decimal' });
		} else {
			try {
				accentColor = convertColor(color, { from: 'discord', to: 'decimal' });
			} catch (err) {
				accentColor = defaultAccent;
				logger.error(`Error: ${err.message || err}`, {
					label: 'core',
				});
			}
		}
	}

	const container = new ContainerBuilder().setAccentColor(accentColor);

	if (title) {
		container.addTextDisplayComponents(...chunkTextDisplay(`## ${title}`));

		container.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);
	}

	if (description) {
		container.addTextDisplayComponents(...chunkTextDisplay(description));
	}

	if (media && media.length > 0) {
		container.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);

		const gallery = new MediaGalleryBuilder();
		media.forEach((url) => {
			gallery.addItems([new MediaGalleryItemBuilder().setURL(url)]);
		});
		container.addMediaGalleryComponents(gallery);
	}

	if (components && components.length > 0) {
		container.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);

		components.forEach((row) => {
			container.addActionRowComponents(row);
		});
	}

	if (footer) {
		container.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);

		let footerContent;
		if (typeof footer === 'string') {
			footerContent = footer;
		} else {
			footerContent = await t(interaction, 'common.container.footer', {
				username: interaction.client.user.username,
			});
		}

		container.addTextDisplayComponents(...chunkTextDisplay(footerContent));
	}

	return [container];
}

async function getChannelSafe(guild, channelId) {
	if (!channelId) return null;
	let channel = guild.channels.cache.get(channelId);

	if (!channel) {
		try {
			channel = await guild.channels.fetch(channelId).catch(() => null);
		} catch (_e) {
			return null;
		}
	}
	return channel;
}

async function getTextChannelSafe(guild, channelId) {
	const channel = await getChannelSafe(guild, channelId);
	if (channel?.isTextBased() && channel.viewable) {
		return channel;
	}
	return null;
}

async function getMemberSafe(guild, userId) {
	if (!guild || !userId) return null;

	let member = guild.members.cache.get(userId);
	if (member) return member;

	try {
		member = await guild.members.fetch(userId).catch(() => null);
	} catch (_e) {}

	return member || null;
}

async function getGuildSafe(client, guildId) {
	if (!client || !guildId) return null;

	let guild = client.guilds.cache.get(guildId);
	if (guild) return guild;

	try {
		guild = await client.guilds.fetch(guildId).catch(() => null);
	} catch (_e) {}

	return guild || null;
}

async function isTeam(container, userId) {
	const { helpers, models } = container;
	const { KythiaTeam } = models;

	if (helpers.discord.isOwner(userId)) return true;

	if (!KythiaTeam) return false;

	const teams = await KythiaTeam.getCache({ userId: userId });
	return !!(teams && teams.length > 0);
}

async function isPremium(container, userId) {
	const { helpers, models } = container;
	const { KythiaUser } = models;

	if (helpers.discord.isOwner(userId)) return true;

	if (!KythiaUser) return false;

	const premium = await KythiaUser.getCache({ userId: userId });
	if (!premium) return false;
	if (premium.premiumExpiresAt && new Date() > premium.premiumExpiresAt)
		return false;
	return premium.isPremium === true;
}

async function premiumLocked(interaction, container, requiredTier = 'none') {
	if (requiredTier === 'none') return true;
	if (container.helpers.discord.isOwner(interaction.user.id)) return true;

	const { t, helpers, redis, models, kythiaConfig } = container;
	const { KythiaUser } = models;

	// Skip if user is a team member
	const teamCacheKey = `kythia:middleware:teamOnly:${interaction.user.id}`;
	let isTeamMember = await redis.get(teamCacheKey);
	if (isTeamMember !== null) {
		isTeamMember = JSON.parse(isTeamMember);
	} else {
		isTeamMember = await helpers.discord.isTeam(container, interaction.user.id);
		await redis.set(
			teamCacheKey,
			JSON.stringify(Boolean(isTeamMember)),
			'EX',
			1800,
		);
	}
	if (isTeamMember) return true;

	const requiredTierLevel = TIER_LEVELS[requiredTier] || 0;

	// Get user's actual premium tier
	const premiumCacheKey = `kythia:middleware:premiumTier:${interaction.user.id}`;
	let userPremiumTier = await redis.get(premiumCacheKey);

	if (!userPremiumTier) {
		// Fetch from DB
		const user = await KythiaUser.getCache({ userId: interaction.user.id });

		// Check if premium is active
		let activeTier = 'none';
		if (user?.premiumTier) {
			if (
				user.premiumExpiresAt &&
				new Date(user.premiumExpiresAt).getTime() > Date.now()
			) {
				activeTier = user.premiumTier;
			} else if (!user.premiumExpiresAt) {
				// Lifetime or external premium
				activeTier = user.premiumTier;
			} else {
				// Expired
				user.premiumTier = 'none';
				user.premiumExpiresAt = null;
				user.changed('premiumTier', true);
				user.changed('premiumExpiresAt', true);
				await user.save();
			}
		}

		userPremiumTier = activeTier;
		// Cache for 5 minutes
		await redis.set(premiumCacheKey, userPremiumTier, 'EX', 300);
	}

	const userTierLevel = TIER_LEVELS[userPremiumTier] || 0;

	if (userTierLevel < requiredTierLevel) {
		const { convertColor } = helpers.color;
		const errContainer = new ContainerBuilder().setAccentColor(
			convertColor('Red', {
				from: 'discord',
				to: 'decimal',
			}),
		);

		const requiredTierName =
			requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1);

		errContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				await t(interaction, 'common.error.premium.locked.text', {
					tier: requiredTierName,
					username: interaction.client.user.username,
				}),
			),
		);

		errContainer.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);

		errContainer.addActionRowComponents(
			new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setLabel(await t(interaction, 'common.error.premium.locked.button'))
					.setStyle(ButtonStyle.Link)
					.setURL(kythiaConfig.settings.patreon), // Optional external link
			),
		);

		errContainer.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);

		errContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				await t(interaction, 'common.container.footer', {
					username: interaction.client.user.username,
				}),
			),
		);

		if (interaction.isRepliable()) {
			if (interaction.replied || interaction.deferred) {
				await interaction.editReply({
					components: [errContainer],
					flags: MessageFlags.IsComponentsV2,
				});
			} else {
				await interaction.reply({
					components: [errContainer],
					flags: MessageFlags.IsComponentsV2,
				});
			}
		}
		return false;
	}

	return true;
}

async function voteLocked(interaction, container) {
	if (container.helpers.discord.isOwner(interaction.user.id)) return true;

	const { kythiaConfig, t, helpers, redis } = container;

	// Skip vote lock if user is a team member
	const teamCacheKey = `kythia:middleware:teamOnly:${interaction.user.id}`;
	let isTeamMember = await redis.get(teamCacheKey);
	if (isTeamMember !== null) {
		isTeamMember = JSON.parse(isTeamMember);
	} else {
		isTeamMember = await helpers.discord.isTeam(container, interaction.user.id);
		await redis.set(
			teamCacheKey,
			JSON.stringify(Boolean(isTeamMember)),
			'EX',
			1800,
		);
	}
	if (isTeamMember) return true;

	// Skip vote lock if user is premium
	const premiumCacheKey = `kythia:middleware:premium:${interaction.user.id}`;
	let isPremiumUser = await redis.get(premiumCacheKey);
	if (isPremiumUser !== null) {
		isPremiumUser = JSON.parse(isPremiumUser);
	} else {
		isPremiumUser = await helpers.discord.isPremium(
			container,
			interaction.user.id,
		);
		await redis.set(
			premiumCacheKey,
			JSON.stringify(Boolean(isPremiumUser)),
			'EX',
			1800,
		);
	}
	if (isPremiumUser) return true;

	const { KythiaVoter } = container.models;
	const { convertColor } = helpers.color;

	if (!kythiaConfig.api.topgg.authToken) return true;

	const cacheKey = `kythia:middleware:voteLocked:${interaction.user.id}`;
	let isVoteLocked = await redis.get(cacheKey);

	if (isVoteLocked !== null) {
		isVoteLocked = JSON.parse(isVoteLocked);
	} else {
		const voter = await KythiaVoter.getCache({
			userId: interaction.user.id,
		});
		const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
		isVoteLocked = !voter || new Date(voter.votedAt) < twelveHoursAgo;

		if (!isVoteLocked) {
			// Cache that they are NOT vote locked for 30 minutes
			await redis.set(cacheKey, JSON.stringify(false), 'EX', 1800);
		} else {
			// Cache that they ARE vote locked for a short time (60s) so they can vote and retry quickly
			await redis.set(cacheKey, JSON.stringify(true), 'EX', 60);
		}
	}

	if (isVoteLocked) {
		const errContainer = new ContainerBuilder().setAccentColor(
			convertColor(kythiaConfig.bot.color, {
				from: 'hex',
				to: 'decimal',
			}),
		);

		errContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				await t(interaction, 'common.error.vote.locked.text'),
			),
		);

		errContainer.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);

		errContainer.addActionRowComponents(
			new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setLabel(
						await t(interaction, 'common.error.vote.locked.button', {
							username: interaction.client.user.username,
						}),
					)
					.setStyle(ButtonStyle.Link)
					.setURL(`https://top.gg/bot/${kythiaConfig.bot.clientId}/vote`),
			),
		);

		errContainer.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);

		errContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				await t(interaction, 'common.container.footer', {
					username: interaction.client.user.username,
				}),
			),
		);

		if (interaction.isRepliable()) {
			if (interaction.replied || interaction.deferred) {
				await interaction.editReply({
					components: [errContainer],
					flags: MessageFlags.IsComponentsV2,
				});
			} else {
				await interaction.reply({
					components: [errContainer],
					flags: MessageFlags.IsComponentsV2,
				});
			}
		}
		return false;
	}

	return true;
}

async function isVoterActive(container, userId) {
	const { models } = container;
	const { KythiaUser } = models;

	if (!KythiaUser) return false;

	const user = await KythiaUser.getCache({ userId });
	if (!user) return false;
	if (!user.isVoted || !user.voteExpiresAt || new Date() > user.voteExpiresAt)
		return false;
	return true;
}

const timeLocaleCache = {};
async function getLocalizedTime(container, locale) {
	const { t } = container;
	if (timeLocaleCache[locale]) return timeLocaleCache[locale];

	const days = await Promise.all([
		t({ locale }, 'core.helpers.stats.days.sunday'),
		t({ locale }, 'core.helpers.stats.days.monday'),
		t({ locale }, 'core.helpers.stats.days.tuesday'),
		t({ locale }, 'core.helpers.stats.days.wednesday'),
		t({ locale }, 'core.helpers.stats.days.thursday'),
		t({ locale }, 'core.helpers.stats.days.friday'),
		t({ locale }, 'core.helpers.stats.days.saturday'),
	]);
	const months = await Promise.all([
		t({ locale }, 'core.helpers.stats.months.january'),
		t({ locale }, 'core.helpers.stats.months.february'),
		t({ locale }, 'core.helpers.stats.months.march'),
		t({ locale }, 'core.helpers.stats.months.april'),
		t({ locale }, 'core.helpers.stats.months.may'),
		t({ locale }, 'core.helpers.stats.months.june'),
		t({ locale }, 'core.helpers.stats.months.july'),
		t({ locale }, 'core.helpers.stats.months.august'),
		t({ locale }, 'core.helpers.stats.months.september'),
		t({ locale }, 'core.helpers.stats.months.october'),
		t({ locale }, 'core.helpers.stats.months.november'),
		t({ locale }, 'core.helpers.stats.months.december'),
	]);

	timeLocaleCache[locale] = { days, months };
	return timeLocaleCache[locale];
}

/**
 * Resolve placeholders in a string using provided data and locale.
 */
async function resolvePlaceholders(container, str, data, locale) {
	const { t } = container;
	if (typeof str !== 'string') return '';

	const now = new Date();
	const { days, months } = await getLocalizedTime(container, locale);

	let guildAge = 'Unknown';
	if (data.createdAt) {
		const created = new Date(data.createdAt);
		const diff = now - created;
		const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
		const monthsDiff = Math.floor(
			(diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30),
		);
		const daysDiff = Math.floor(
			(diff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24),
		);
		const yearsLabel =
			years > 0 ? await t({ locale }, 'core.helpers.stats.years') : '';
		const monthsLabel = await t({ locale }, 'core.helpers.stats.months.months');
		const daysLabel = await t({ locale }, 'core.helpers.stats.days.days');
		guildAge =
			years > 0
				? `${years} ${yearsLabel} ${monthsDiff} ${monthsLabel} ${daysDiff} ${daysLabel}`
				: `${monthsDiff} ${monthsLabel} ${daysDiff} ${daysLabel}`;
	}

	const verifiedStr = data.verified
		? await t({ locale }, 'core.helpers.stats.verified.yes')
		: await t({ locale }, 'core.helpers.stats.verified.no');
	const partneredStr = data.partnered
		? await t({ locale }, 'core.helpers.stats.partnered.yes')
		: await t({ locale }, 'core.helpers.stats.partnered.no');

	const formatDate = (d) => {
		if (!(d instanceof Date) || Number.isNaN(d)) return 'Unknown';
		return d.toLocaleDateString(locale, {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		});
	};
	const formatTime = (d) => {
		if (!(d instanceof Date) || Number.isNaN(d)) return 'Unknown';
		return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
	};

	/**
	 * ===== AVAILBLE PLACEHOLDERS =====
	 *
	 * {user}
	 * {user_id}
	 * {tag}
	 * {username}
	 * {memberstotal}
	 * {membercount}
	 * {boosts}
	 * {boostcount}
	 * {boost_level}
	 * {channels}
	 * {text_channels}
	 * {voice_channels}
	 * {categories}
	 * {announcement_channels}
	 * {stage_channels}
	 * {roles}
	 * {emojis}
	 * {stickers}
	 * {guild}
	 * {guild_id}
	 * {owner}
	 * {owner_id}
	 * {region}
	 * {verified}
	 * {partnered}
	 * {date}
	 * {time}
	 * {datetime}
	 * {day}
	 * {month}
	 * {year}
	 * {hour}
	 * {minute}
	 * {second}
	 * {timestamp}
	 * {created_date}
	 * {created_time}
	 * {guild_age}
	 * {member_join}
	 */
	const placeholders = {
		'{user}': data.userId ? `<@${data.userId}>` : 'Unknown',
		'{user_id}': data.userId || '0',
		'{mention}': data.userId ? `<@${data.userId}>` : 'Unknown', // alias for {user}
		'{tag}': data.tag ? `#${data.tag}` : 'Unknown',
		'{username}': data.username || 'Unknown',

		'{memberstotal}': data.members ?? 0,
		'{members}': data.members ?? 0,
		'{membercount}': data.members ?? 0, // alias for {members}

		'{boosts}': data.boosts ?? 0,
		'{boostcount}': data.boosts ?? 0, // alias for {boosts}
		'{boost_level}': data.boostLevel ?? 0,
		'{channels}': data.channels ?? 0,
		'{text_channels}': data.textChannels ?? 0,
		'{voice_channels}': data.voiceChannels ?? 0,
		'{categories}': data.categories ?? 0,
		'{announcement_channels}': data.announcementChannels ?? 0,
		'{stage_channels}': data.stageChannels ?? 0,
		'{roles}': data.roles ?? 0,
		'{emojis}': data.emojis ?? 0,
		'{stickers}': data.stickers ?? 0,

		'{guild}': data.guildName || 'Server',
		'{servername}': data.guildName || 'Server', // alias for {guild}
		'{guild_id}': data.guildId || '0',
		'{owner}': data.ownerName || 'Owner',
		'{owner_id}': data.ownerId || '0',
		'{region}': data.region || 'ID',
		'{verified}': verifiedStr,
		'{partnered}': partneredStr,

		'{date}': formatDate(now),
		'{time}': formatTime(now),

		'{datetime}': `${formatDate(now)} ${formatTime(now)}`,
		'{day}': days[now.getDay()],
		'{month}': months[now.getMonth()],
		'{year}': now.getFullYear().toString(),
		'{hour}': now.getHours().toString().padStart(2, '0'),
		'{minute}': now.getMinutes().toString().padStart(2, '0'),
		'{second}': now.getSeconds().toString().padStart(2, '0'),
		'{timestamp}': now.getTime().toString(),

		'{created_date}': data.createdAt
			? formatDate(new Date(data.createdAt))
			: 'Unknown',
		'{created_time}': data.createdAt
			? formatTime(new Date(data.createdAt))
			: 'Unknown',
		'{guild_age}': guildAge,
		'{member_join}': data.memberJoin
			? formatDate(new Date(data.memberJoin))
			: 'Unknown',
	};

	let result = str;
	for (const [key, val] of Object.entries(placeholders)) {
		if (typeof result === 'string') {
			result = result.replace(
				new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
				val?.toString() ?? '',
			);
		}
	}
	if (typeof result !== 'string') return '';
	return result;
}

async function safeResolvePlaceholder(
	container,
	member,
	text,
	statsData,
	fallback = '',
) {
	if (typeof text !== 'string' || !text.trim()) return fallback;
	try {
		let result = await resolvePlaceholders(
			container,
			text,
			statsData,
			member.guild.preferredLocale,
		);
		if (typeof result === 'string') {
			result = result.replace(/\\n/g, '\n');
		}
		if (result == null) return fallback;
		return result;
	} catch (_e) {
		return fallback;
	}
}

module.exports = {
	embedFooter,
	setVoiceChannelStatus,
	simpleContainer,
	createContainer,
	getChannelSafe,
	getTextChannelSafe,
	getMemberSafe,
	getGuildSafe,
	isTeam,
	isPremium,
	premiumLocked,
	voteLocked,
	isVoterActive,
	chunkTextDisplay,
	resolvePlaceholders,
	safeResolvePlaceholder,
};
