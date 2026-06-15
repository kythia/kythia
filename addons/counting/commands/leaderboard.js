/**
 * @namespace: addons/counting/commands/leaderboard.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class LeaderboardCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('leaderboard')
			.setDescription('View the top counters in the server.');

	async execute(interaction) {
		const container = this.container;
		const { models, t, helpers } = container;
		const { CountingUser } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const topUsers = await CountingUser.getAllCache({
			where: { guildId: interaction.guild.id },
			order: [['correctCounts', 'DESC']],
			limit: 10,
		});

		if (!topUsers || topUsers.length === 0) {
			const emptyDesc = await t(interaction, 'counting.leaderboard.empty');
			await interaction.editReply({
				components: await simpleContainer(interaction, emptyDesc, {
					color: 'Yellow',
				}),
				flags: MessageFlags.IsComponentsV2,
			});
			return;
		}

		let leaderboardText = '';
		for (let i = 0; i < topUsers.length; i++) {
			const stat = topUsers[i];
			leaderboardText += `**#${i + 1}** <@${stat.userId}> - ${stat.correctCounts} ✅ / ${stat.ruinedCounts} ❌\n`;
		}

		const desc = await t(interaction, 'counting.leaderboard.description', {
			board: leaderboardText,
		});

		await interaction.editReply({
			components: await simpleContainer(interaction, desc, {
				color: 'Gold',
			}),
			flags: MessageFlags.IsComponentsV2,
			allowedMentions: {
				parse: [],
			},
		});
	}
}

exports.default = LeaderboardCommand;
