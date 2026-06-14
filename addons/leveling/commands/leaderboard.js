/**
 * @namespace: addons/leveling/commands/leaderboard.js
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
			.setDescription("See the server's level leaderboard.");

	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers, kythiaConfig } = container;
		const { simpleContainer } = helpers.discord;
		const { User } = models;

		await interaction.deferReply();
		const guildId = interaction.guild.id;
		const topUsers = await User.getAllCache({
			where: { guildId: guildId },
			order: [
				['level', 'DESC'],
				['xp', 'DESC'],
			],
			limit: 10,
			cacheTags: [`User:leaderboard:byGuild:${guildId}`],
		});

		let leaderboard;
		if (topUsers.length === 0) {
			leaderboard = await t(
				interaction,
				'leveling.leaderboard.leveling.leaderboard.empty',
			);
		} else {
			leaderboard = (
				await Promise.all(
					topUsers.map(
						async (user, index) =>
							await t(
								interaction,
								'leveling.leaderboard.leveling.leaderboard.entry',
								{
									rank: index + 1,
									userId: user.userId,
									level: user.level || 0,
									xp: user.xp || 0,
								},
							),
					),
				)
			).join('\n');
		}

		const components = await simpleContainer(
			interaction,
			`## ${await t(interaction, 'leveling.leaderboard.leveling.leaderboard.title')}\n${leaderboard}`,
			{ color: kythiaConfig.bot.color },
		);

		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
			allowedMentions: {
				parse: [],
			},
		});
	}
}

exports.default = LeaderboardCommand;
