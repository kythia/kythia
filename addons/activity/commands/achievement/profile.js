/**
 * @namespace: addons/activity/commands/achievement/profile.js
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

const { BaseCommand } = require('kythia-core');

const { ALL_ACHIEVEMENTS } = require('../../helpers/achievementChecker');

class ProfileCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('profile')
			.setDescription('🏆 View your achievement profile banner.')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('The user to view. Defaults to yourself.'),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, models, kythiaConfig, helpers, queueManager } = container;
		const { UserAchievement } = models;
		const { convertColor } = helpers.color;

		await interaction.deferReply();

		const targetUser = interaction.options.getUser('user') || interaction.user;

		const guildId = interaction.guild.id;
		const userId = targetUser.id;

		const unlockedCount = await UserAchievement.countCache({
			where: {
				guildId,
				userId,
			},
		});

		const totalCount = ALL_ACHIEVEMENTS.length;
		const imageName = 'achievement-profile.png';

		const job = await queueManager.dispatch(
			'kythia-image-queue',
			'achievement-profile',
			{
				type: 'achievementBanner',
				userId,
				options: {
					botToken: kythiaConfig.bot.token,
					achievementName: `${unlockedCount}/${totalCount} Achievements`,
					achievementDesc: `${targetUser.username} has unlocked ${unlockedCount} out of ${totalCount} achievements in this server.`,
					rarity:
						unlockedCount >= totalCount * 0.75
							? 'legendary'
							: unlockedCount >= totalCount * 0.5
								? 'epic'
								: unlockedCount >= totalCount * 0.25
									? 'rare'
									: 'common',
					unlockedCount,
					totalCount,
					customFont: 'BagelFatOne-Regular',
					fontWeight: 'normal',
					customWidth: 885,
					customHeight: 280,
				},
			},
		);

		const result = await queueManager.waitFor(job, 'kythia-image-queue');
		const buffer = Buffer.from(result.data);

		const profileContainer = new ContainerBuilder()
			.setAccentColor(
				convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(interaction, 'activity.commands.achievement.profile.title', {
						username: targetUser.username,
					}),
				),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(interaction, 'activity.commands.achievement.profile.status', {
						unlockedCount,
						totalCount,
					}),
				),
			)
			.addMediaGalleryComponents(
				new MediaGalleryBuilder().addItems([
					new MediaGalleryItemBuilder().setURL(`attachment://${imageName}`),
				]),
			);

		await interaction.editReply({
			components: [profileContainer],
			files: [
				{
					attachment: buffer,
					name: imageName,
				},
			],
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = ProfileCommand;
