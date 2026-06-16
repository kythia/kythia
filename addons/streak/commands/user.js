/**
 * @namespace: addons/streak/commands/user.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { getOrCreateStreak, getTodayDateString } = require('../helpers');
const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class UserCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('user')
			.setDescription('Lihat streak user lain.')
			.addUserOption((option) =>
				option
					.setName('target')
					.setDescription('User yang ingin dicek streak-nya')
					.setRequired(false),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
		const guildId = interaction.guild.id;
		const serverSetting = await ServerSetting.getCache({
			guildId,
		});
		const streakEmoji = serverSetting.streakEmoji || '🔥';
		await interaction.deferReply();
		const target = interaction.options.getUser('target') || interaction.user;
		if (!target) {
			const msg = `${await t(interaction, 'streak.streak.user.not.found.title')}\n
						${await t(interaction, 'streak.streak.user.not.found.desc')}`;
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const targetId = target.id;
		const streak = await getOrCreateStreak(container, targetId, guildId);
		const today = getTodayDateString();
		const lastClaimDateStr = streak.lastClaimTimestamp
			? streak.lastClaimTimestamp.toISOString().slice(0, 10)
			: null;
		const status =
			lastClaimDateStr === today
				? await t(interaction, 'streak.streak.me.status.claimed')
				: await t(interaction, 'streak.streak.me.status.not.claimed');
		let member;
		try {
			member = await helpers.discord.getMemberSafe(interaction.guild, targetId);
		} catch {
			member = null;
		}
		const displayName = member ? member.displayName : target.username;
		const msg =
			(await t(interaction, 'streak.streak.user.title.user_md', {
				username: displayName,
			})) +
			'\n' +
			status +
			'\n\n' +
			(await t(interaction, 'streak.streak.claim.desc', {
				currentStreak: streak.currentStreak,
				highestStreak: streak.highestStreak,
				streakFreezes: streak.streakFreezes ?? 0,
				emoji: streakEmoji,
			}));
		const components = await simpleContainer(interaction, msg);
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
exports.default = UserCommand;
