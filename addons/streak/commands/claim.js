/**
 * @namespace: addons/streak/commands/claim.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ButtonStyle,
	MessageFlags,
	ButtonBuilder,
	ActionRowBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
const { claimStreak, restoreStreak } = require('../helpers');

const { BaseCommand } = require('kythia-core');

class ClaimCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('claim')
			.setDescription(
				'🔥 Claim your streak for today, keep your streak continue!',
			);

	async execute(interaction) {
		const container = this.container;
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
							[
								await t(interaction, 'streak.streak.restore.title_md'),
								await t(interaction, 'streak.streak.restore.desc', {
									streak: streak.currentStreak,
									emoji: streakEmoji,
								}),
							].join('\n'),
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
								[
									await t(interaction, 'streak.streak.restore.title_md'),
									await t(interaction, 'streak.streak.restore.vote.required', {
										streak: streak.currentStreak,
										emoji: streakEmoji,
									}),
								].join('\n'),
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
					const roleMentions = await Promise.all(
						restoredRewards.map(async (roleId) => {
							const role = await helpers.discord.getRoleSafe(
								interaction.guild,
								roleId,
							);
							return role ? `<@&${role.id}>` : `Role ID: ${roleId}`;
						}),
					);
					rewardMsg = `\n${await t(interaction, 'streak.streak.claim.reward', {
						roles: roleMentions.join(', '),
					})}`;
				}

				const successMsg = [
					await t(interaction, 'streak.streak.restore.title_md'),
					await t(interaction, 'streak.streak.restore.success', {
						streak: restoredStreak.currentStreak,
						emoji: streakEmoji,
					}),
					rewardMsg,
					await t(interaction, 'streak.streak.claim.desc', {
						currentStreak: restoredStreak.currentStreak,
						highestStreak: restoredStreak.highestStreak,
						streakFreezes: restoredStreak.streakFreezes,
						emoji: streakEmoji,
					}),
				]
					.filter(Boolean)
					.join('\n');

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

					const expiredMsg = [
						await t(interaction, 'streak.streak.claim.title_md'),
						await t(interaction, 'streak.streak.restore.expired'),
						await t(interaction, 'streak.streak.claim.desc', {
							currentStreak: streak.currentStreak,
							highestStreak: streak.highestStreak,
							streakFreezes: streak.streakFreezes,
							emoji: streakEmoji,
						}),
					].join('\n');

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
			const roleMentions = await Promise.all(
				rewardRolesGiven.map(async (roleId) => {
					const role = await helpers.discord.getRoleSafe(
						interaction.guild,
						roleId,
					);
					return role ? `<@&${role.id}>` : `Role ID: ${roleId}`;
				}),
			);
			rewardMsg = `${await t(interaction, 'streak.streak.claim.reward', {
				roles: roleMentions.join(', '),
			})}`;
		}

		const finalMessage = [
			await t(interaction, 'streak.streak.claim.title_md'),
			message,
			rewardMsg,
			await t(interaction, 'streak.streak.claim.desc', {
				currentStreak: streak.currentStreak,
				highestStreak: streak.highestStreak,
				streakFreezes: streak.streakFreezes,
				emoji: streakEmoji,
			}),
		]
			.filter(Boolean)
			.join('\n');
		const components = await simpleContainer(interaction, finalMessage);
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = ClaimCommand;
