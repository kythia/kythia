/**
 * @namespace: addons/counting/commands/stats.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class StatsCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('stats')
			.setDescription("View a user's counting statistics.")
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('The user to view stats for.')
					.setRequired(false),
			);

	async execute(interaction) {
		const container = this.container;
		const { models, t, helpers } = container;
		const { CountingUser } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const targetUser = interaction.options.getUser('user') || interaction.user;

		const stats = await CountingUser.getCache({
			where: { guildId: interaction.guild.id, userId: targetUser.id },
		});

		const correct = stats ? stats.correctCounts : 0;
		const ruined = stats ? stats.ruinedCounts : 0;
		const total = correct + ruined;
		const accuracy = total > 0 ? ((correct / total) * 100).toFixed(1) : 0;

		const desc = await t(interaction, 'counting.stats.description', {
			user: targetUser.toString(),
			correct: correct,
			ruined: ruined,
			accuracy: accuracy,
		});

		await interaction.editReply({
			components: await simpleContainer(interaction, desc, {
				color: 'Blurple',
			}),
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = StatsCommand;
