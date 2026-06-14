/**
 * @namespace: addons/streak/commands/reset.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	updateNickname,
	syncStreakRoles,
	getOrCreateStreak,
} = require('../helpers');
const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class ResetCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('reset')
			.setDescription("Reset YOUR streak to 0 (be careful, can't be undone).");

	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;

		const userId = interaction.user.id;
		const guildId = interaction.guild.id;

		const serverSetting = await ServerSetting.getCache({ guildId });
		const streakEmoji = serverSetting.streakEmoji || '🔥';
		const streakMinimum =
			typeof serverSetting.streakMinimum === 'number'
				? serverSetting.streakMinimum
				: 3;
		const streakRoleReward = Array.isArray(serverSetting.streakRoleRewards)
			? serverSetting.streakRoleRewards
			: [];

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		const streak = await getOrCreateStreak(container, userId, guildId);

		if (streak.currentStreak === 0) {
			const msg = `## ${await t(interaction, 'streak.streak.reset.title')}\n${await t(
				interaction,
				'streak.streak.reset.already.zero',
			)}`;
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		streak.lastStreak = streak.currentStreak; // snapshot for /streak restore
		streak.currentStreak = 0;
		streak.lastClaimTimestamp = null;
		streak.lastRestoreTimestamp = null; // allow restore after this reset

		await streak.save();
		if (serverSetting.streakNickname === true) {
			await updateNickname(interaction.member, 0, streakEmoji, streakMinimum);
		}

		await syncStreakRoles(interaction.member, 0, streakRoleReward);

		const msg = `## ${await t(interaction, 'streak.streak.reset.title')}\n${await t(interaction, 'streak.streak.reset.success')}`;

		const components = await simpleContainer(interaction, msg);

		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = ResetCommand;
