/**
 * @namespace: addons/leveling/commands/profile.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	MediaGalleryBuilder,
	SeparatorSpacingSize,
	MediaGalleryItemBuilder,
} = require('discord.js');

const { levelUpXp } = require('../helpers');
const { Op } = require('sequelize');

const { BaseCommand } = require('kythia-core');

class ProfileCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('profile')
			.setDescription("Check your or another user's level profile.")
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('The user whose profile you want to see.'),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, models, kythiaConfig, helpers, queueManager } = container;
		const { User, LevelingSetting } = models;
		const { convertColor } = helpers.color;

		await interaction.deferReply();

		const guildId = interaction.guild.id;

		// Load per-guild leveling settings (null = table row does not exist yet)
		const levelingSetting = await LevelingSetting.getCache({ guildId });

		const curve = levelingSetting?.levelingCurve || 'linear';
		const multiplier =
			typeof levelingSetting?.levelingMultiplier === 'number'
				? levelingSetting.levelingMultiplier
				: 1.0;

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
		// ----------------------------------------------------------------------------

		const targetUser = interaction.options.getUser('user') || interaction.user;

		let user = await User.getCache({
			userId: targetUser.id,
			guildId,
		});

		if (!user) {
			user = await User.create({
				userId: targetUser.id,
				guildId,
				xp: 0,
				level: 1,
			});

			const title = `## ${await t(interaction, 'leveling.profile.leveling.profile.created.title')}`;
			const desc = await t(
				interaction,
				'leveling.profile.leveling.profile.created.desc',
			);
			const footerText = await t(interaction, 'common.container.footer', {
				username: interaction.client.user.username,
			});

			const accentColor = convertColor('Yellow', {
				from: 'discord',
				to: 'decimal',
			});

			const createdContainer = new ContainerBuilder()
				.setAccentColor(accentColor)
				.addTextDisplayComponents(new TextDisplayBuilder().setContent(title))
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addTextDisplayComponents(new TextDisplayBuilder().setContent(desc))
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(footerText),
				);

			return interaction.editReply({
				components: [createdContainer],
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const imageName = 'level-profile.png';

		const rank =
			Number(
				await User.countCache({
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
				}),
			) + 1;

		const job = await queueManager.dispatch('kythia-image-queue', 'profile', {
			type: 'profileImage',
			userId: targetUser.id,
			options: {
				botToken: kythiaConfig.bot.token,

				customWidth: 1024,
				customHeight: 450,
				customTag: `Level ${user.level}`,
				customSubtitle: `XP Progress`,

				customDate: new Date().toISOString(),

				customBackground: backgroundUrl,

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
			},
		});

		const result = await queueManager.waitFor(job, 'kythia-image-queue');
		const buffer = Buffer.from(result.data);

		const accentColorDecimal = convertColor(accentColorHex, {
			from: 'hex',
			to: 'decimal',
		});

		const titleText = `## ${await t(interaction, 'leveling.profile.leveling.profile.title')}`;
		const descText = await t(
			interaction,
			'leveling.profile.leveling.profile.desc',
			{
				username: targetUser.username,
				level: user.level || 0,
				xp: user.xp || 0,
				nextLevelXp: levelUpXp(user.level, curve, multiplier),
			},
		);

		// const footerText = ;

		const profileContainer = new ContainerBuilder()
			.setAccentColor(accentColorDecimal)

			.addTextDisplayComponents(new TextDisplayBuilder().setContent(titleText))
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)

			.addTextDisplayComponents(new TextDisplayBuilder().setContent(descText))

			.addMediaGalleryComponents(
				new MediaGalleryBuilder().addItems([
					new MediaGalleryItemBuilder().setURL(`attachment://${imageName}`),
				]),
			);

		// .addSeparatorComponents(
		// 	new SeparatorBuilder()
		// 		.setSpacing(SeparatorSpacingSize.Small)
		// 		.setDivider(true),
		// )
		// .addTextDisplayComponents(
		// 	new TextDisplayBuilder().setContent(await t(interaction, 'common.container.footer', {
		// 		username: interaction.client.user.username,
		// 	})),
		// );

		await interaction.editReply({
			components: [profileContainer],
			files: [{ attachment: buffer, name: imageName }],
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = ProfileCommand;
