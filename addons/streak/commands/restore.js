/**
 * @namespace: addons/streak/commands/restore.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { restoreLastStreak } = require('../helpers');

const { BaseCommand } = require('kythia-core');

class RestoreCommand extends BaseCommand {
	subcommand = true;
	voteLocked = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('restore')
			.setDescription(
				'🔄 Restore your lost streak back to what it was before the reset.',
			);

	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;

		const guildId = interaction.guild.id;
		const serverSetting = await ServerSetting.getCache({ guildId });
		const streakEmoji = serverSetting?.streakEmoji || '🔥';

		await interaction.deferReply();

		const targetMember = interaction.member;

		const { status, streak, rewardRolesGiven, restoreCount, restoreQuota } =
			await restoreLastStreak(container, targetMember, serverSetting);

		if (status === 'NO_STREAK_TO_RESTORE') {
			const msg = `## ${await t(interaction, 'streak.streak.restore.last.title')}\n${await t(
				interaction,
				'streak.streak.restore.last.nothing',
				{ emoji: streakEmoji },
			)}`;
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		if (status === 'ALREADY_RESTORED') {
			const msg = `## ${await t(interaction, 'streak.streak.restore.last.title')}\n${await t(
				interaction,
				'streak.streak.restore.last.already',
				{ emoji: streakEmoji },
			)}`;
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		if (status === 'QUOTA_EXCEEDED') {
			const msg = `## ${await t(interaction, 'streak.streak.restore.last.title')}\n${await t(
				interaction,
				'streak.streak.restore.last.quota_exceeded',
				{
					quota: restoreQuota,
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

		// SUCCESS
		let rewardMsg = '';
		if (rewardRolesGiven?.length > 0) {
			const roleMentions = rewardRolesGiven.map((roleId) => {
				const role = interaction.guild.roles.cache.get(roleId);
				return role ? `<@&${role.id}>` : `Role ID: ${roleId}`;
			});
			rewardMsg = `\n${await t(interaction, 'streak.streak.claim.reward', {
				roles: roleMentions.join(', '),
			})}`;
		}

		const targetMention = interaction.user.toString();

		const msg = `## ${await t(interaction, 'streak.streak.restore.last.title')}\n${await t(
			interaction,
			'streak.streak.restore.last.success',
			{
				user: targetMention,
				streak: streak.currentStreak,
				emoji: streakEmoji,
			},
		)}${rewardMsg}\n\n${await t(interaction, 'streak.streak.claim.desc', {
			currentStreak: streak.currentStreak,
			highestStreak: streak.highestStreak,
			streakFreezes: streak.streakFreezes ?? 0,
			emoji: streakEmoji,
		})}\n-# ${await t(
			interaction,
			'streak.streak.restore.last.quota_remaining',
			{
				remaining: restoreQuota - restoreCount,
				quota: restoreQuota,
			},
		)}`;

		const components = await simpleContainer(interaction, msg);
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = RestoreCommand;
