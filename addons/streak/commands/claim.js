/**
 * @namespace: addons/streak/commands/claim.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
const { claimStreak, restoreStreak } = require('../helpers');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('claim')
			.setDescription(
				'🔥 Claim your streak for today, keep your streak continue!',
			),
	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, helpers, kythiaConfig } = container;
		const { ServerSetting, KythiaVoter } = models;
		const { simpleContainer } = helpers.discord;
		const { convertColor } = helpers.color;

		const guildId = interaction.guild.id;
		const serverSetting = await ServerSetting.getCache({ guildId });
		const streakEmoji = serverSetting.streakEmoji || '🔥';

		await interaction.deferReply();

		const { status, streak, rewardRolesGiven } = await claimStreak(
			container,
			interaction.member,
			serverSetting,
		);

		if (status === 'ALREADY_CLAIMED') {
			const msg = `${await t(interaction, 'streak.streak.claim.already.title')}\n ${await t(
				interaction,
				'streak.streak.claim.already.desc',
				{
					streak: streak.currentStreak,
					emoji: streakEmoji,
				},
			)}`;
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		// Missed exactly 1 day — offer vote-gated restore
		if (status === 'CAN_RESTORE') {
			const accentColor = convertColor(kythiaConfig.bot.color, {
				from: 'hex',
				to: 'decimal',
			});

			const buildRestoreMessage = async (restoreDisabled = false) => {
				const promptContainer = new ContainerBuilder()
					.setAccentColor(accentColor)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`## ${await t(interaction, 'streak.streak.restore.title')}\n${await t(
								interaction,
								'streak.streak.restore.desc',
								{
									streak: streak.currentStreak,
									emoji: streakEmoji,
								},
							)}`,
						),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addActionRowComponents(
						new ActionRowBuilder().addComponents(
							new ButtonBuilder()
								.setCustomId('streak_restore')
								.setLabel(await t(interaction, 'streak.streak.restore.button'))
								.setStyle(ButtonStyle.Success)
								.setDisabled(restoreDisabled),
						),
					)
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
				return promptContainer;
			};

			const promptContainer = await buildRestoreMessage();
			const message = await interaction.editReply({
				components: [promptContainer],
				flags: MessageFlags.IsComponentsV2,
				fetchReply: true,
			});

			const collector = message.createMessageComponentCollector({
				filter: (i) => i.user.id === interaction.user.id,
				time: 60_000,
				max: 1,
			});

			collector.on('collect', async (i) => {
				if (i.customId !== 'streak_restore') return;

				// Check if the user has voted in the last 12 hours
				const voter = await KythiaVoter.getCache({ userId: i.user.id });
				const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
				const hasVoted = voter && new Date(voter.votedAt) >= twelveHoursAgo;

				if (!hasVoted) {
					// Show vote required message, replace action row with vote link button
					const voteContainer = new ContainerBuilder()
						.setAccentColor(accentColor)
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(
								`## ${await t(interaction, 'streak.streak.restore.title')}\n${await t(
									interaction,
									'streak.streak.restore.vote.required',
									{
										streak: streak.currentStreak,
										emoji: streakEmoji,
									},
								)}`,
							),
						)
						.addSeparatorComponents(
							new SeparatorBuilder()
								.setSpacing(SeparatorSpacingSize.Small)
								.setDivider(true),
						)
						.addActionRowComponents(
							new ActionRowBuilder().addComponents(
								new ButtonBuilder()
									.setLabel(
										await t(interaction, 'streak.streak.restore.vote.button', {
											username: interaction.client.user.username,
										}),
									)
									.setStyle(ButtonStyle.Link)
									.setURL(
										`https://top.gg/bot/${kythiaConfig.bot.clientId}/vote`,
									),
							),
						)
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

					return i.update({
						components: [voteContainer],
						flags: MessageFlags.IsComponentsV2,
					});
				}

				// Voted — restore the streak
				const { streak: restoredStreak, rewardRolesGiven: restoredRewards } =
					await restoreStreak(container, interaction.member, serverSetting);

				let rewardMsg = '';
				if (restoredRewards.length > 0) {
					const roleMentions = restoredRewards.map((roleId) => {
						const role = interaction.guild.roles.cache.get(roleId);
						return role ? `<@&${role.id}>` : `Role ID: ${roleId}`;
					});
					rewardMsg = `\n${await t(interaction, 'streak.streak.claim.reward', {
						roles: roleMentions.join(', '),
					})}`;
				}

				const successMsg = `## ${await t(interaction, 'streak.streak.restore.title')}\n${await t(
					interaction,
					'streak.streak.restore.success',
					{
						streak: restoredStreak.currentStreak,
						emoji: streakEmoji,
					},
				)}${rewardMsg}\n${await t(interaction, 'streak.streak.claim.desc', {
					currentStreak: restoredStreak.currentStreak,
					highestStreak: restoredStreak.highestStreak,
					streakFreezes: restoredStreak.streakFreezes,
					emoji: streakEmoji,
				})}`;

				const successComponents = await simpleContainer(
					interaction,
					successMsg,
				);
				return i.update({
					components: successComponents,
					flags: MessageFlags.IsComponentsV2,
				});
			});

			collector.on('end', async (collected) => {
				if (collected.size > 0) return; // handled above

				// Timed out — reset the streak to 1
				try {
					streak.currentStreak = 1;
					if (streak.currentStreak > (streak.highestStreak || 0)) {
						streak.highestStreak = streak.currentStreak;
					}
					streak.lastClaimTimestamp = new Date();
					await streak.save();

					const expiredMsg = `## ${await t(interaction, 'streak.streak.claim.title')}\n${await t(
						interaction,
						'streak.streak.restore.expired',
					)}\n${await t(interaction, 'streak.streak.claim.desc', {
						currentStreak: streak.currentStreak,
						highestStreak: streak.highestStreak,
						streakFreezes: streak.streakFreezes,
						emoji: streakEmoji,
					})}`;

					const expiredComponents = await simpleContainer(
						interaction,
						expiredMsg,
						{ color: 'Red' },
					);
					await interaction.editReply({
						components: expiredComponents,
						flags: MessageFlags.IsComponentsV2,
					});
				} catch (_e) {}
			});

			return;
		}

		let message;
		if (status === 'FREEZE_USED') {
			message = await t(interaction, 'streak.streak.claim.freeze.used', {
				streakFreezes: streak.streakFreezes,
			});
		} else if (status === 'CONTINUE') {
			message = await t(interaction, 'streak.streak.claim.continue');
		} else {
			message = await t(interaction, 'streak.streak.claim.new.streak');
		}

		let rewardMsg = '';
		if (rewardRolesGiven.length > 0) {
			const roleMentions = rewardRolesGiven.map((roleId) => {
				const role = interaction.guild.roles.cache.get(roleId);
				return role ? `<@&${role.id}>` : `Role ID: ${roleId}`;
			});
			rewardMsg = `${await t(interaction, 'streak.streak.claim.reward', {
				roles: roleMentions.join(', '),
			})}`;
		}

		const title = await t(interaction, 'streak.streak.claim.title');
		const finalMessage = `## ${title}\n${message}\n${rewardMsg}\n${await t(
			interaction,
			'streak.streak.claim.desc',
			{
				currentStreak: streak.currentStreak,
				highestStreak: streak.highestStreak,
				streakFreezes: streak.streakFreezes,
				emoji: streakEmoji,
			},
		)}`;
		const components = await simpleContainer(interaction, finalMessage);
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
