/**
 * @namespace: addons/leveling/helpers/index.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { rankCard } = require('kythia-arts');

const {
	MessageFlags,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	MediaGalleryBuilder,
	SeparatorSpacingSize,
	MediaGalleryItemBuilder,
} = require('discord.js');
const { Op } = require('sequelize');

/**
 * Calculate the XP required to level up from the given level,
 * based on the server's leveling curve and multiplier.
 *
 * @param {number} level - The current level.
 * @param {'linear'|'exponential'|'constant'} [curve='linear'] - The curve type.
 * @param {number} [multiplier=1.0] - The XP multiplier.
 * @returns {number}
 */
const levelUpXp = (level, curve = 'linear', multiplier = 1.0) => {
	let base;
	switch (curve) {
		case 'exponential':
			base = Math.floor(100 * 1.5 ** (level - 1));
			break;
		case 'constant':
			base = 100;
			break;
		default:
			base = level * level * 50;
			break;
	}
	return Math.max(1, Math.floor(base * multiplier));
};

/**
 * Calculate level and remaining XP from total XP,
 * respecting curve type, multiplier, and optional max level.
 *
 * @param {number} totalXp
 * @param {'linear'|'exponential'|'constant'} [curve='linear']
 * @param {number} [multiplier=1.0]
 * @param {number|null} [maxLevel=null]
 * @returns {{ newLevel: number, newXp: number }}
 */
const calculateLevelAndXp = (
	totalXp,
	curve = 'linear',
	multiplier = 1.0,
	maxLevel = null,
) => {
	let level = 1;
	let xp = totalXp;
	while (xp >= levelUpXp(level, curve, multiplier)) {
		if (maxLevel !== null && level >= maxLevel) {
			xp = Math.min(xp, levelUpXp(level, curve, multiplier) - 1);
			break;
		}
		xp -= levelUpXp(level, curve, multiplier);
		level += 1;
	}
	return { newLevel: level, newXp: xp };
};

const addXp = async (guildId, userId, xpToAdd, message, channel) => {
	const { container } = message.client;
	const { helpers, t, models, kythiaConfig, logger } = container;
	const { LevelingSetting, User } = models;
	const { getTextChannelSafe } = helpers.discord;
	const { convertColor } = helpers.color;

	// Load per-guild leveling settings from the dedicated table
	const levelingSetting = await LevelingSetting.getCache({ guildId });

	const curve = levelingSetting?.levelingCurve || 'linear';
	const multiplier =
		typeof levelingSetting?.levelingMultiplier === 'number'
			? levelingSetting.levelingMultiplier
			: 1.0;
	const maxLevel =
		typeof levelingSetting?.levelingMaxLevel === 'number'
			? levelingSetting.levelingMaxLevel
			: null;

	// Resolve notification channel from leveling_settings, then fall back to message channel
	let notifyChannel = channel || message.channel;
	if (levelingSetting?.levelingChannelId) {
		const configuredChannel = await getTextChannelSafe(
			message.guild,
			levelingSetting.levelingChannelId,
		).catch(() => null);
		if (configuredChannel) {
			notifyChannel = configuredChannel;
		}
	}

	// ---------- visual config with per-guild overrides --------------------------
	const botColor = kythiaConfig.bot.color || '#5865F2';

	const backgroundUrl =
		levelingSetting?.levelingBackgroundUrl ??
		kythiaConfig.addons?.leveling?.backgroundUrl ??
		null;
	const borderColor = levelingSetting?.levelingBorderColor || botColor;
	const barColor = levelingSetting?.levelingBarColor || botColor;
	const usernameColor = levelingSetting?.levelingUsernameColor || '#FFFFFF';
	const tagColor = levelingSetting?.levelingTagColor || botColor;
	const accentColorHex = levelingSetting?.levelingAccentColor || botColor;
	const [user] = await User.getOrCreateCache(
		{ userId: userId, guildId: guildId },
		{ guildId, userId, xp: 0, level: 1 },
	);

	// If user is already at max level, do nothing
	if (maxLevel !== null && user.level >= maxLevel) return;

	user.xp = Number(BigInt(user.xp) + BigInt(xpToAdd));
	let leveledUp = false;
	const levelBefore = user.level;

	while (user.xp >= levelUpXp(user.level, curve, multiplier)) {
		if (maxLevel !== null && user.level >= maxLevel) {
			user.xp = levelUpXp(user.level, curve, multiplier) - 1;
			break;
		}
		user.xp -= levelUpXp(user.level, curve, multiplier);
		user.level += 1;
		leveledUp = true;
	}

	user.changed('xp', true);
	user.changed('level', true);
	await user.save();

	if (!leveledUp) return;

	const member = await helpers.discord.getMemberSafe(message.guild, userId);

	let rewardRoleName = null;
	let rewardLevel = null;
	if (levelingSetting && Array.isArray(levelingSetting.roleRewards)) {
		const rewards = levelingSetting.roleRewards.filter(
			(r) => r.level > levelBefore && r.level <= user.level,
		);

		if (rewards.length > 0) {
			const highestReward = rewards.reduce((a, b) =>
				a.level > b.level ? a : b,
			);
			const role = await helpers.discord.getRoleSafe(
				message.guild,
				highestReward.role,
			);
			if (role && member) {
				await member.roles.add(role).catch(() => {});
				rewardRoleName = role.name;
				rewardLevel = highestReward.level;
			}
		}
	}

	let buffer = null;
	const imageName = 'level-up.png';
	const isImageEnabled = levelingSetting?.levelingImageEnabled !== false;

	if (isImageEnabled) {
		try {
			const rank =
				(await User.countCache({
					where: {
						guildId,
						[Op.or]: [
							{ level: { [Op.gt]: user.level } },
							{
								level: user.level,
								xp: { [Op.gt]: user.xp },
							},
						],
					},
				})) + 1;

			buffer = await rankCard(userId, {
				botToken: kythiaConfig.bot.token,
				customTag: `Level Up!`,
				customSubtitle: `New Level: ${user.level}`,
				customWidth: 1024,
				customHeight: 450,
				customDate: new Date().toISOString(),
				customBackground: backgroundUrl,
				font: 'NOTO_SANS',
				usernameColor,
				tagColor,
				borderColor,
				rankData: {
					currentXp: user.xp,
					requiredXp: levelUpXp(user.level, curve, multiplier),
					level: user.level,
					barColor,
					levelColor: tagColor,
					rank,
				},
				customFont: 'BagelFatOne-Regular',
				fontWeight: 'normal',
				badgesFrame: false,
				disabledBadges: false,
				squareAvatar: false,
				moreBackgroundBlur: false,
			});
		} catch (err) {
			logger.error(`Failed to generate level up image: ${err.message || err}`, {
				label: 'leveling:helpers',
			});
			buffer = null;
		}
	}

	const accentColor = convertColor(accentColorHex, {
		from: 'hex',
		to: 'decimal',
	});

	const titleText = `${await t(message, 'leveling.helpers.index.leveling.profile.up.title')}`;

	const defaultMsg = 'GG {user.mention}, you reached level **{user.level}**!';
	const rawMessage = levelingSetting?.levelingMessage || defaultMsg;
	const descText = rawMessage
		.replace(/{user\.mention}/g, message.author.toString())
		.replace(/{user\.level}/g, user.level.toString())
		.replace(/{user\.xp}/g, user.xp.toString())
		.replace(/{user\.name}/g, message.author.username);

	const containerBuilder = new ContainerBuilder()
		.setAccentColor(accentColor)
		.addTextDisplayComponents(new TextDisplayBuilder().setContent(titleText))
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		)
		.addTextDisplayComponents(new TextDisplayBuilder().setContent(descText));

	if (rewardRoleName && rewardLevel) {
		const rewardTitle = `### ${await t(message, 'leveling.helpers.index.leveling.role.reward.title')}`;
		const rewardDesc = await t(
			message,
			'leveling.helpers.index.leveling.role.reward.desc',
			{
				mention: message.author.toString(),
				role: rewardRoleName,
				level: rewardLevel,
			},
		);

		containerBuilder
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(rewardTitle),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(rewardDesc),
			);
	}

	if (buffer && (Buffer.isBuffer(buffer) || typeof buffer === 'string')) {
		containerBuilder.addMediaGalleryComponents(
			new MediaGalleryBuilder().addItems([
				new MediaGalleryItemBuilder().setURL(`attachment://${imageName}`),
			]),
		);
	}

	const footerText = await t(message, 'common.container.footer', {
		username: message.client.user.username,
	});

	containerBuilder
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		)
		.addTextDisplayComponents(new TextDisplayBuilder().setContent(footerText));

	if (notifyChannel?.send) {
		const payload = {
			// content: message.author.toString(),
			components: [containerBuilder],
			flags: MessageFlags.IsComponentsV2,
		};

		if (buffer && (Buffer.isBuffer(buffer) || typeof buffer === 'string')) {
			payload.files = [{ attachment: buffer, name: imageName }];
		}

		await notifyChannel.send(payload).catch((err) => {
			logger.error(`Leveling Announce send failed: ${err.message || err}`, {
				label: 'leveling:helpers',
			});
		});
	}
};

module.exports = {
	levelUpXp,
	calculateLevelAndXp,
	addXp,
};
