/**
 * @namespace: addons/pet/commands/leaderboard.js
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
		subcommand.setName('leaderboard').setDescription('View pet leaderboard!');
	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers, kythiaConfig } = container;
		const { simpleContainer } = helpers.discord;
		const { UserPet, Pet } = models;
		await interaction.deferReply();
		const leaderboard = await UserPet.getAllCache({
			include: [
				{
					model: Pet,
					as: 'pet',
				},
			],
			order: [
				[
					UserPet.sequelize.literal(
						'CASE WHEN pet.rarity = "common" THEN 1 WHEN pet.rarity = "rare" THEN 2 WHEN pet.rarity = "epic" THEN 3 WHEN pet.rarity = "legendary" THEN 4 END',
					),
					'DESC',
				],
				['level', 'DESC'],
			],
			limit: 10,
			cacheTags: ['UserPet:leaderboard'],
		});
		let leaderboardDesc;
		if (leaderboard.length) {
			// Await all translations before joining
			const entries = await Promise.all(
				leaderboard.map(async (pet, index) => {
					let user;
					try {
						user = await helpers.discord.getUserSafe(
							interaction.client,
							pet.userId,
						);
					} catch (_e) {
						user = null;
					}
					return t(interaction, 'pet.leaderboard.entry', {
						index: index + 1,
						userId: pet.userId,
						username: user?.username || 'Unknown',
						icon: pet.pet.icon,
						rarity: pet.pet.rarity,
						name: pet.pet.name,
						level: pet.level,
					});
				}),
			);
			leaderboardDesc = entries.join('\n');
		} else {
			leaderboardDesc = await t(interaction, 'pet.leaderboard.empty');
		}
		const components = await simpleContainer(
			interaction,
			`${await t(interaction, 'pet.leaderboard.title')}\n${leaderboardDesc}`,
			{
				color: kythiaConfig.bot.color,
			},
		);
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
			allowedMentions: {
				parse: [],
			},
		});
	}
}
exports.default = LeaderboardCommand;
